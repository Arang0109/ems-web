import React from "react";

import type { DigitLimits } from "@shared/lib";
import {
  exceedsDigitLimits, maskNumericInput, normalizeNumericInput, toggleNumericSign,
} from "@shared/lib";

interface Options extends DigitLimits {
  /** 확정값. 타이핑 중인 미완성 값(`"-"`·`"12."`)은 훅 내부에만 있다 */
  value: string;
  onChange: (value: string) => void;
  /** 음수 허용 여부. 호스트는 `min` prop 에서 유도한다 */
  allowNegative?: boolean;
  /** ↑/↓ 증감 폭 */
  step?: number;
  disabled?: boolean;
}

interface NumericInput {
  /** 화면에 그릴 표시값 — 미완성 상태를 포함한다 */
  text: string;
  /** 입력 요소에 그대로 펼칠 속성 */
  inputProps: {
    type: "text";
    inputMode: "decimal";
    autoComplete: "off";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  };
  /** 부호 토글(±) 버튼의 동작 */
  toggleSign: () => void;
}

/** `String(step)` 의 소수 자릿수 — 증감 후 부동소수 오차(0.1+0.2)를 잘라내는 기준 */
const decimalsOf = (step: number): number => {
  const dot = String(step).indexOf(".");
  return dot === -1 ? 0 : String(step).length - dot - 1;
};

/**
 * 숫자 입력의 동작 계층 — `type="text" inputMode="decimal"` 위에 마스킹·확정·부호 토글을 얹는다.
 *
 * `<input type="number">` 를 대체한다. 모바일 숫자 키패드에 `-` 키가 없어 음수를 칠 수 없고,
 * 제어 컴포넌트에서는 미완성 입력(`"-"`·`"12."`)에 브라우저가 빈 문자열을 돌려줘 타이핑이 지워지기 때문이다.
 *
 * 프레임까지 갖춘 컴포넌트는 `NumericField` 다. 이 훅은 `InputGroup` 처럼
 * **입력 요소를 직접 조립하는 호스트**가 같은 동작을 얻기 위해 쓴다.
 *
 * `maxIntDigits`·`maxDecimals` 를 주면 **타이핑은 초과분을 버리고, ↑/↓ 증감은 제한 밖으로
 * 아예 움직이지 않는다.** 바깥에서 들어온 `value` 는 자르지 않는다 — 자릿수는 타이핑
 * 제약이지 값 제약이 아니라서, 저장된 기록을 화면이 몰래 자르면 데이터 손실이 된다.
 */
export const useNumericInput = ({
  value,
  onChange,
  allowNegative = true,
  step = 1,
  disabled = false,
  maxIntDigits,
  maxDecimals,
}: Options): NumericInput => {
  const limits: DigitLimits = { maxIntDigits, maxDecimals };

  // 타이핑 중인 표시값. 확정 전(`"12."`)에는 value 와 어긋나므로 별도로 든다.
  const [text, setText] = React.useState(value);
  // 마지막으로 폼에 올린 값 — value 가 "바깥에서" 바뀐 것인지 판별하는 기준이다.
  const [committed, setCommitted] = React.useState(value);

  // 바깥에서 값이 갈아끼워지면(시트 전환·자동계산) 타이핑 중이던 표시값을 버린다.
  // 렌더 중 조정이라 effect 처럼 화면이 한 번 더 그려지지 않는다.
  if (value !== committed) {
    setCommitted(value);
    setText(value);
  }

  const commit = (next: string) => {
    setText(next);
    if (next === committed) return;

    setCommitted(next);
    onChange(next);
  };

  const shift = (direction: 1 | -1) => {
    const base = Number(normalizeNumericInput(text) || "0");
    if (!Number.isFinite(base)) return;

    const next = base + step * direction;
    if (!allowNegative && next < 0) return;

    const candidate = String(Number(next.toFixed(decimalsOf(step))));
    // 자릿수 밖으로는 증감하지 않는다 — 잘라 붙이면 의도와 다른 값이 된다(`9999+1` → `"1000"`).
    if (exceedsDigitLimits(candidate, limits)) return;

    commit(candidate);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    // 조합키가 얹힌 ↑/↓ 는 증감이 아니다 — 입력 표의 셀 이동(`useGridNavigation`)에 넘긴다
    if (e.altKey || e.ctrlKey || e.metaKey) return;

    e.preventDefault();
    shift(e.key === "ArrowUp" ? 1 : -1);
  };

  return {
    text,
    inputProps: {
      type: "text",
      inputMode: "decimal",
      autoComplete: "off",
      value: text,
      onChange: (e) => commit(maskNumericInput(e.target.value, { allowNegative, ...limits })),
      // 확정은 자릿수를 늘리지 않는다 — `".5"` → `"0.5"` 의 `0` 은 선행 0 이라 세지 않고,
      // 나머지 보정(`"007"` → `"7"`, `"12."` → `"12"`)은 전부 줄이는 방향이다. 재검사가 필요 없다.
      onBlur: () => commit(normalizeNumericInput(text)),
      onKeyDown: handleKeyDown,
    },
    toggleSign: () => {
      if (disabled) return;
      commit(toggleNumericSign(text));
    },
  };
};
