import React from "react";

import {
  InputGroup as InputGroupPrimitive,
  InputGroupInput,
  InputGroupAddon
} from "@/components/ui/input-group";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

interface InputGroupProps<T = string> {
  id?: string;
  type?: string;
  placeholder?: string;

  value: T;
  onChange?: (value: T) => void;

  label?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  helperText?: string;

  invalid?: boolean;
  error?: string;

  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const InputGroup = <T extends string | number>({
  id,
  type = "text",
  placeholder = "...",
  value,
  onChange,
  label,
  disabled,
  readOnly,
  required,
  helperText,
  invalid,
  error,
  startIcon,
  endIcon,
}: InputGroupProps<T>) => {
  const input = (
    <InputGroupPrimitive>
      {startIcon && 
        <InputGroupAddon
          className={error? 'text-red-500' : ""}
        >{startIcon}</InputGroupAddon>}
      <InputGroupInput
        id={id}
        type={type}
        value={String(value)}
        onChange={(e) => onChange?.(e.target.value as T)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        aria-invalid={invalid}
      />
      {endIcon && <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>}
    </InputGroupPrimitive>
  );

  if (!label) return input;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </FieldLabel>
      {input}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
      {error && <FieldDescription className="text-red-500">{error}</FieldDescription>}
    </Field>
  );
};
