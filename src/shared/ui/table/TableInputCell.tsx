import React from "react";

import { NumericField, TimeField } from "@shared/ui/form";

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
}) => (
  <td colSpan={colSpan} className="border border-rule">
    <div className="flex items-center">
      {type === "time" ? (
        // 네이티브 시각 위젯은 열 폭보다 넓어 표를 밀어낸다
        <TimeField
          value={value}
          onChange={onChange}
          frame="none"
          disabled={disabled}
          inputClassName="p-2 sm:px-3 sm:py-2.5 text-body-3
            focus:ring-2 focus:ring-inset focus:ring-brand-primary"
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
          inputClassName="p-2 sm:px-3 sm:py-2.5 text-body-3
            focus:ring-2 focus:ring-inset focus:ring-brand-primary"
        />
      ) : (
        <input
          value={value}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? ""}
          disabled={disabled}
          className="w-full p-2 sm:px-3 sm:py-2.5 text-body-3 text-ink bg-transparent
            placeholder:text-muted-ink
            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary
            disabled:cursor-not-allowed disabled:text-muted-ink"
          min={min}
          max={max}
          step={step}
        />
      )}
      {unit && <span className="pr-1.5 text-caption text-muted-ink shrink-0"><i>{unit}</i></span>}
    </div>
  </td>
);
