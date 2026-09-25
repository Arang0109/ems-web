import React from "react";

import { Input as InputPrimitive } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FieldTone } from "@shared/model";
import { toneFrameClass } from "./field-tone";
import { ValueInput } from "./ValueInput";

interface InlineInputProps {
  id?: string;
  name?: string;

  value: string | number;
  onChange?: (value: string) => void;

  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  /** 입력칸(프레임)의 폭. 부모를 꽉 채우려면 `className` 으로 루트를 늘리고 `"w-full"` 을 준다 */
  width?: string;
  /** 루트 클래스 — 루트는 `inline-flex` 라 내용 폭으로 잡힌다. 늘리려면 `"flex-1"` 등을 넘긴다 */
  className?: string;

  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;

  /**
   * 정수부·소수부 최대 자릿수 — `type="number"` 에서만 쓰인다.
   * 넘기면 타이핑이 들어가지 않는다. 좁은 인라인 칸에서 값이 프레임을 넘지 않게 하는 장치다.
   */
  maxIntDigits?: number;
  maxDecimals?: number;

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
  className,
  prefix,
  suffix,
  disabled = false,
  readOnly = false,
  required,
  min,
  max,
  step,
  maxIntDigits,
  maxDecimals,
  tone = "default",
}: InlineInputProps) => {
  // 톤은 값을 고칠 수 있는 칸에서만 의미가 있다 — 읽기 전용 칸까지 물들이지 않는다.
  const frameClass = toneFrameClass(readOnly ? "default" : tone);

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5", className)}>
      {prefix && (
        <span className="text-body-2 text-muted-ink whitespace-nowrap">{prefix}</span>
      )}
      <ValueInput
        type={type}
        id={id}
        value={String(value)}
        onChange={(v) => onChange?.(v)}
        min={min}
        step={step}
        maxIntDigits={maxIntDigits}
        maxDecimals={maxDecimals}
        label={typeof prefix === "string" ? prefix : undefined}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={cn(width, frameClass)}
        inputClassName={type === "number" ? "text-center" : undefined}
        renderText={() => (
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
      />
      {suffix && (
        <span className="text-body-2 text-muted-ink whitespace-nowrap">{suffix}</span>
      )}
    </span>
  );
};
