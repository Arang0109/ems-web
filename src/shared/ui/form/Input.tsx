import React from "react";

import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input as InputField } from "@/components/ui/input";

interface InputProps<T = string> {
  id?: string;
  label?: React.ReactNode;

  value: T;
  onChange?: (value: T) => void;

  type?: React.HTMLInputTypeAttribute;
  name?: string;
  placeholder?: string;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  min?: number;
  max?: number;
  step?: number;

  autoComplete?: string;
  helperText?: string;
}

export const Input = <T extends string | number>({
  id,
  label,
  value,
  onChange,
  type = "text",
  name,
  placeholder,
  disabled = false,
  readOnly = false,
  required,
  min,
  max,
  step,
  autoComplete,
  helperText,
}: InputProps<T>) => {
  const isStringLabel = typeof label === "string";

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </FieldLabel>
      <InputField
        id={id}
        type={type}
        name={name}
        value={String(value)}
        onChange={(e) => onChange?.(e.target.value as T)}
        placeholder={placeholder ?? (isStringLabel ? (label as string) : undefined)}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
      />
      {helperText && (
        <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  );
};
