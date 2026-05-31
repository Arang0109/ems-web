import React from "react";

import { Input as InputPrimitive } from "@/components/ui/input";

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
        <span className="text-sm text-gray-700 whitespace-nowrap">{prefix}</span>
      )}
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
      {suffix && (
        <span className="text-sm text-gray-700 whitespace-nowrap">{suffix}</span>
      )}
    </span>
  );
};
