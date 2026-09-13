import React from "react";

import {
  InputGroup as InputGroupPrimitive,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton
} from "@shared/ui/primitives";
import { useNumericInput } from "@shared/model";
import { Field, FieldDescription } from "@shared/ui/primitives";
import { cn } from "@/lib/utils";
import { InFieldLabel } from "./InFieldLabel";
import {
  IN_FIELD_CONTROL_HEIGHT,
  IN_FIELD_VALUE_CLASS,
  inFieldPlaceholder,
} from "./in-field";

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
 * 라벨이 칸 안으로 들어오면 칸은 38px 에서 48px 로 커진다.
 * 아이콘·± 버튼 애드온은 라벨 높이만큼 내려야 입력 글줄과 눈높이가 맞는다.
 */
const LABELED_GROUP_CLASS = cn(IN_FIELD_CONTROL_HEIGHT, "[&>[data-slot=input-group-addon]]:mt-4");
const LABELED_CONTROL_CLASS = cn("h-full", IN_FIELD_VALUE_CLASS);

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
} & Pick<React.ComponentProps<typeof InputGroupInput>, "id" | "placeholder" | "aria-invalid" | "className">) => {
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
  placeholder,
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
  const hasLabel = !!label;

  const effectivePlaceholder = hasLabel
    ? (inFieldPlaceholder(placeholder, label) ?? "")
    : (placeholder ?? "...");

  const input = (
    <InputGroupPrimitive className={cn(hasLabel && LABELED_GROUP_CLASS)}>
      {hasLabel && (
        <InFieldLabel
          htmlFor={id}
          required={required}
          invalid={invalid}
          disabled={disabled}
          // 아이콘이 있으면 아이콘 애드온 폭(24px)+입력 좌패딩(6px)만큼 들여 글줄 시작점에 맞춘다
          className={startIcon ? "left-7.5" : "left-2.5"}
        >
          {label}
        </InFieldLabel>
      )}
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
          placeholder={effectivePlaceholder}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(hasLabel && LABELED_CONTROL_CLASS)}
        />
      ) : (
        <InputGroupInput
          id={id}
          type={type}
          value={String(value)}
          onChange={(e) => onChange?.(e.target.value as T)}
          placeholder={effectivePlaceholder}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={invalid}

          min={min}
          max={max}
          step={step}
          className={cn(hasLabel && LABELED_CONTROL_CLASS)}
        />
      )}
      {endIcon && <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>}
    </InputGroupPrimitive>
  );

  if (!hasLabel) return input;

  return (
    <Field data-invalid={invalid} className="gap-1.5">
      {input}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
      {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
    </Field>
  );
};
