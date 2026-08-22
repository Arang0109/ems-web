import React from "react";

import { Input as InputPrimitive } from "@/components/ui/input";
import { NumericField } from "./NumericField";
import { TimeField } from "./TimeField";

interface InlineInputProps {
  id?: string;
  name?: string;

  value: string | number;
  onChange?: (value: string) => void;

  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  width?: string;

  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export const InlineInput = ({
  id,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  width = "w-20",
  prefix,
  suffix,
  disabled = false,
  readOnly = false,
  required,
  min,
  max,
  step,
}: InlineInputProps) => {
  return (
    <span className="inline-flex items-center gap-1.5">
      {prefix && (
        <span className="text-body-2 text-muted-foreground whitespace-nowrap">{prefix}</span>
      )}
      {type === "time" ? (
        // 네이티브 시각 위젯은 브라우저마다 폭·모양이 달라 인라인 배치가 무너진다
        <TimeField
          id={id}
          value={String(value)}
          onChange={(v) => onChange?.(v)}
          label={typeof prefix === "string" ? prefix : undefined}
          disabled={disabled}
          className={width}
        />
      ) : type === "number" && !readOnly ? (
        // 모바일 숫자 키패드에는 `-` 가 없다 — 부호는 ± 버튼이 맡는다
        <NumericField
          id={id}
          value={String(value)}
          onChange={(v) => onChange?.(v)}
          allowNegative={min === undefined || min < 0}
          step={step}
          label={typeof prefix === "string" ? prefix : undefined}
          disabled={disabled}
          placeholder={placeholder}
          className={width}
          inputClassName="text-center"
        />
      ) : (
        <InputPrimitive
          id={id}
          name={name}
          type={type}
          value={String(value)}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          min={min}
          max={max}
          step={step}
          className={`${width} text-center`}
        />
      )}
      {suffix && (
        <span className="text-body-2 text-muted-foreground whitespace-nowrap">{suffix}</span>
      )}
    </span>
  );
};
