import React from "react";

import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea as TextareaPrimitive } from "@/components/ui/textarea";

interface TextareaProps {
  id?: string;
  label?: React.ReactNode;

  value: string;
  onChange?: (value: string) => void;

  name?: string;
  placeholder?: string;
  rows?: number;

  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;

  maxLength?: number;
  helperText?: string;
}

export const Textarea = ({
  id,
  label,
  value,
  onChange,
  name,
  placeholder,
  rows,
  disabled = false,
  readOnly = false,
  required,
  maxLength,
  helperText,
}: TextareaProps) => {
  const isStringLabel = typeof label === "string";

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </FieldLabel>
      <TextareaPrimitive
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder ?? (isStringLabel ? (label as string) : undefined)}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        maxLength={maxLength}
      />
      {helperText && (
        <FieldDescription>{helperText}</FieldDescription>
      )}
    </Field>
  );
};
