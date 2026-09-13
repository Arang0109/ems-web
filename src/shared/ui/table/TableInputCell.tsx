import React from "react";

import type { FieldTone } from "@shared/model";
import { NumericField, TimeField } from "@shared/ui/form";
import { cn } from "@/lib/utils";

import { cellFaceClass, isCellFilled } from "./cell-face";

// 기록지형 테이블의 입력 셀 — 우측에 단위 표기.
// 면 색은 `UnitField` 와 같은 규칙이다 — 값이 차면 연초록, 톤이 그 위를 덮는다.
export const TableInputCell = ({
  value,
  onChange,
  placeholder,
  colSpan,
  unit,
  type = "text",
  disabled = false,
  min,
  max,
  step,
  maxIntDigits,
  maxDecimals,
  tone = "default",
  showComplete = true,
  onFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  colSpan?: number;
  unit?: React.ReactNode;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** 정수부·소수부 최대 자릿수 — `type="number"` 에서만. 넘기면 타이핑이 들어가지 않는다 */
  maxIntDigits?: number;
  maxDecimals?: number;
  /** 칸의 상태 색. 의미는 호출부가 정한다 (`UnitField` 와 같은 계약) */
  tone?: FieldTone;
  /** 값이 들어차면 면을 연초록으로 물들인다. 완료 개념이 없는 칸에서는 끈다. */
  showComplete?: boolean;
  /** 이 칸에 포커스가 들어왔을 때 — 셀 전체에 걸어 ± 버튼·시계 버튼까지 잡는다 */
  onFocus?: () => void;
}) => {
  const inputClass = cn(
    "p-2 sm:px-3 sm:py-2.5 text-body-3",
    "focus:ring-2 focus:ring-inset focus:ring-brand-primary",
    tone === "info" && "text-info-ink",
  );

  return (
    <td
      colSpan={colSpan}
      onFocusCapture={onFocus}
      className={cn("border border-rule", cellFaceClass(tone, isCellFilled(value, { showComplete, disabled })))}
    >
      <div className="flex items-center">
        {type === "time" ? (
          // 네이티브 시각 위젯은 열 폭보다 넓어 표를 밀어낸다
          <TimeField
            value={value}
            onChange={onChange}
            frame="none"
            disabled={disabled}
            inputClassName={inputClass}
          />
        ) : type === "number" ? (
          // 모바일 숫자 키패드에는 `-` 가 없다 — 부호는 ± 버튼이 맡는다
          <NumericField
            value={value}
            onChange={onChange}
            allowNegative={min === undefined || min < 0}
            step={step}
            maxIntDigits={maxIntDigits}
            maxDecimals={maxDecimals}
            frame="none"
            disabled={disabled}
            placeholder={placeholder}
            inputClassName={inputClass}
          />
        ) : (
          <input
            value={value}
            type={type}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? ""}
            disabled={disabled}
            aria-invalid={tone === "danger" || undefined}
            className={cn(
              "w-full bg-transparent text-ink placeholder:text-muted-ink focus:outline-none",
              "disabled:cursor-not-allowed disabled:text-muted-ink",
              inputClass,
            )}
            min={min}
            max={max}
            step={step}
          />
        )}
        {unit && <span className="pr-1.5 text-caption text-muted-ink shrink-0"><i>{unit}</i></span>}
      </div>
    </td>
  );
};
