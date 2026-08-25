import React from "react";

import type { FieldTone } from "@shared/model";
import { NumericField, TimeField } from "@shared/ui/form";
import { cn } from "@/lib/utils";

/** 톤별 셀 면 색 — `default` 는 칠하지 않는다 */
const TONE_CELL: Record<Exclude<FieldTone, "default">, string> = {
  info: "bg-info-soft",
  danger: "bg-danger-soft",
};

// 기록지형 테이블의 입력 셀 — 우측에 단위 표기
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
  tone = "default",
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
  /** 칸의 상태 색. 의미는 호출부가 정한다 (`UnitField` 와 같은 계약) */
  tone?: FieldTone;
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
      className={cn("border border-rule", tone !== "default" && TONE_CELL[tone])}
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
