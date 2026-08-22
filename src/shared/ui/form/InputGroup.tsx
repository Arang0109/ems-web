import React from "react";

import {
  InputGroup as InputGroupPrimitive,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton
} from "@shared/ui/primitives";
import { useNumericInput } from "@shared/model";
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

/**
 * 숫자 입력 슬롯 — 모바일 숫자 키패드에는 `-` 가 없어 부호를 ± 버튼으로 뒤집는다.
 * 훅이 상태 버퍼를 들기 때문에 별도 컴포넌트로 뗀다 — 그래야 숫자가 아닌 입력이 버퍼를 지지 않는다.
 */
const NumericGroupInput = ({
  value,
  onChange,
  allowNegative,
  step,
  disabled,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  allowNegative: boolean;
  step?: number;
  disabled?: boolean;
} & Pick<React.ComponentProps<typeof InputGroupInput>, "id" | "placeholder" | "aria-invalid">) => {
  const { inputProps, toggleSign } = useNumericInput({ value, onChange, allowNegative, step, disabled });

  return (
    <>
      <InputGroupInput {...rest} {...inputProps} disabled={disabled} />
      {allowNegative && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            // 포커스가 입력창에서 빠지면 blur 확정이 먼저 돌아 표시값이 튄다
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleSign}
            disabled={disabled}
            aria-label="부호 바꾸기"
          >
            <span aria-hidden>±</span>
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </>
  );
};

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
      {type === "number" && !readOnly ? (
        <NumericGroupInput
          id={id}
          value={String(value)}
          onChange={(v) => onChange?.(v as T)}
          allowNegative={min === undefined || min < 0}
          step={step}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid}
        />
      ) : (
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
      )}
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
