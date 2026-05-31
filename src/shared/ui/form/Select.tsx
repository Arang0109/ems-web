import React from "react";
import {
  Select as SelectPrimitive,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectGroupOption {
  label?: string;
  options: SelectOption[];
}

interface SelectProps {
  options?: SelectOption[];
  groups?: SelectGroupOption[];

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string | null) => void;

  placeholder?: string;
  label?: React.ReactNode;
  helperText?: string;

  id?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: "sm" | "default";
}

export const Select = ({
  options,
  groups,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  label,
  helperText,
  id,
  disabled,
  required,
  className,
  size = "default",
}: SelectProps) => {
  const renderItems = () => {
    if (groups) {
      return groups.map((group, index) => (
        <SelectGroup key={index}>
          {group.label && <SelectLabel>{group.label}</SelectLabel>}
          {group.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      ));
    }

    if (options) {
      return (
        <SelectGroup>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      );
    }

    return null;
  };

  const select = (
    <SelectPrimitive
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger id={id} size={size} className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{renderItems()}</SelectContent>
    </SelectPrimitive>
  );

  if (!label) return select;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </FieldLabel>
      {select}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
