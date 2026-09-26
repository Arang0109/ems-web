import React from "react";

import { NumericField } from "./NumericField";
import { TimeField } from "./TimeField";
import type { FieldFrame } from "./field-frame";

interface Props {
  /** `"time"`·`"number"` 은 마스킹 입력으로 바꿔 그린다. 그 밖의 값은 `renderText` 가 그린다 */
  type?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;

  /** 음수 허용 판정에 쓴다 — `min` 이 없거나 음수면 ± 버튼이 생긴다 */
  min?: number;
  step?: number;
  maxIntDigits?: number;
  maxDecimals?: number;

  /** 입력창·부호 버튼의 접근성 이름 */
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  /** 읽기 전용이면 마스킹 입력을 쓰지 않는다 — 고칠 수 없는 칸에 시각 목록·± 버튼은 필요 없다 */
  readOnly?: boolean;

  frame?: FieldFrame;
  /** 마스킹 입력의 루트(프레임) 클래스 */
  className?: string;
  /** 마스킹 입력의 입력창 클래스 */
  inputClassName?: string;

  /** 시각·숫자가 아닐 때(또는 읽기 전용일 때) 그릴 일반 입력 — 호스트마다 생김새가 달라 호스트가 그린다 */
  renderText: () => React.ReactNode;
}

/**
 * 값 입력 슬롯 — `type` 에 따라 시각·숫자·일반 입력으로 갈라 그린다.
 *
 * 네이티브 `type="time"`·`type="number"` 를 쓰지 않는 이유는 각 컴포넌트에 있다(`TimeField`·`NumericField`).
 * `UnitField`·`InlineInput`·`TableInputCell` 이 같은 3갈래를 각자 복사하고 있던 것을 여기로 모았다 —
 * 음수 허용 판정(`min`)과 읽기 전용 처리가 한 곳에서만 정해진다.
 */
export const ValueInput = ({
  type,
  id,
  value,
  onChange,
  min,
  step,
  maxIntDigits,
  maxDecimals,
  label,
  placeholder,
  disabled,
  readOnly,
  frame,
  className,
  inputClassName,
  renderText,
}: Props) => {
  if (readOnly) return renderText();

  if (type === "time") {
    // 네이티브 시각 위젯은 브라우저마다 폭·모양이 달라 프레임과 어긋난다
    return (
      <TimeField
        id={id}
        value={value}
        onChange={onChange}
        frame={frame}
        disabled={disabled}
        label={label}
        className={className}
        inputClassName={inputClassName}
      />
    );
  }

  if (type === "number") {
    // 모바일 숫자 키패드에는 `-` 가 없다 — 부호는 ± 버튼이 맡는다
    return (
      <NumericField
        id={id}
        value={value}
        onChange={onChange}
        allowNegative={min === undefined || min < 0}
        step={step}
        maxIntDigits={maxIntDigits}
        maxDecimals={maxDecimals}
        frame={frame}
        disabled={disabled}
        placeholder={placeholder}
        label={label}
        className={className}
        inputClassName={inputClassName}
      />
    );
  }

  return renderText();
};
