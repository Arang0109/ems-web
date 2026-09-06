import React from "react";

import { Input as InputPrimitive } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldTone } from "@shared/model";
import { toneFrameClass } from "./field-tone";
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

  /**
   * 칸의 상태 색. 의미는 호출부가 정한다 — shared 는 "왜 그 색인지" 모른다.
   * (`UnitField` 와 같은 계약이다)
   */
  tone?: FieldTone;
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
  tone = "default",
}: InlineInputProps) => {
  // 톤은 값을 고칠 수 있는 칸에서만 의미가 있다 — 읽기 전용 칸까지 물들이지 않는다.
  const frameClass = toneFrameClass(readOnly ? "default" : tone);

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
          className={cn(width, frameClass)}
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
          className={cn(width, frameClass)}
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
          className={cn(width, "text-center", frameClass)}
        />
      )}
      {suffix && (
        <span className="text-body-2 text-muted-foreground whitespace-nowrap">{suffix}</span>
      )}
    </span>
  );
};
