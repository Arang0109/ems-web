import React from "react";

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
      {unit && <span className="pr-1.5 text-caption text-muted-ink shrink-0"><i>{unit}</i></span>}
    </div>
  </td>
);
