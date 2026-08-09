import React from "react";

import {
  InputGroup as InputGroupPrimitive,
  InputGroupInput,
  InputGroupAddon
} from "@shared/ui/primitives";
import { Field, FieldLabel, FieldDescription } from "@shared/ui/primitives";

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
  
  min?: number;
  max?: number;
  step?: number;

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
  min,
  max,
  step,
  invalid,
  error,
  startIcon,
  endIcon,
}: InputGroupProps<T>) => {
  const input = (
    <InputGroupPrimitive>
      {startIcon && 
        <InputGroupAddon
          className={error? 'text-destructive' : ""}
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

        min={min}
        max={max}
        step={step}
      />
      {endIcon && <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>}
    </InputGroupPrimitive>
  );

  if (!label) return input;

  return (
    <Field data-invalid={invalid}>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
      {input}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
      {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
    </Field>
  );
};
