import React from "react";

import { Field, FieldDescription } from "@shared/ui/primitives";
import { Textarea as TextareaPrimitive } from "@shared/ui/primitives";
import { cn } from "@/lib/utils";

import { InFieldLabel } from "./InFieldLabel";
import { IN_FIELD_VALUE_CLASS, inFieldPlaceholder } from "./in-field";

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
  const hasLabel = !!label;

  const textarea = (
    <TextareaPrimitive
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={hasLabel ? inFieldPlaceholder(placeholder, label) : placeholder}
      rows={rows}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      maxLength={maxLength}
      // 라벨이 얹힌 첫 줄만큼 글줄을 내린다 — 여러 줄이라 높이는 `rows`·내용이 정한다
      className={cn(hasLabel && cn(IN_FIELD_VALUE_CLASS, "pb-2"))}
    />
  );

  if (!hasLabel) return textarea;

  return (
    <Field className="gap-1.5">
      <div className="relative">
        <InFieldLabel htmlFor={id} required={required} disabled={disabled} className="left-2.5">
          {label}
        </InFieldLabel>
        {textarea}
      </div>
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
