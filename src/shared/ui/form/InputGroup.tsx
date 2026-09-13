import React from "react";

import {
  InputGroup as InputGroupPrimitive,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton
} from "@shared/ui/primitives";
import { useNumericInput } from "@shared/model";
import {
  BUSINESS_NUMBER_DIGITS, PHONE_NUMBER_DIGITS,
  formatBusinessNumber, formatPhoneNumber, maskCodeInput,
} from "@shared/lib";
import { Field, FieldDescription } from "@shared/ui/primitives";
import { cn } from "@/lib/utils";
import { InFieldLabel } from "./InFieldLabel";
import {
  IN_FIELD_CONTROL_HEIGHT,
  IN_FIELD_VALUE_CLASS,
  inFieldPlaceholder,
} from "./in-field";

/** 자릿수 코드의 갈래 — 표시 형식과 자릿수 상한이 함께 정해진다 */
export type CodeKind = "business" | "phone";

const CODE_SPEC = {
  business: {
    format: formatBusinessNumber,
    digits: BUSINESS_NUMBER_DIGITS,
    inputMode: "numeric",
  },
  phone: {
    format: formatPhoneNumber,
    digits: PHONE_NUMBER_DIGITS,
    inputMode: "tel",
  },
} as const satisfies Record<
  CodeKind,
  { format: (v: string) => string; digits: number; inputMode: "numeric" | "tel" }
>;

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

  /**
   * 정수부·소수부 최대 자릿수 — `type="number"` 에서만 쓰인다.
   * 넘기면 타이핑이 들어가지 않는다. 자릿수 **코드**(사업자번호·전화번호)는 `code` 를 쓴다.
   */
  maxIntDigits?: number;
  maxDecimals?: number;

  /**
   * 자릿수 코드 모드 — 화면에는 `238-32-48234` 로 끊어 보여주고,
   * `value`/`onChange` 는 **숫자만 남은 문자열**로 주고받는다.
   * 자릿수를 넘기면 타이핑이 들어가지 않는다.
   *
   * 숫자 **값** 입력(`type="number"`)과 갈래가 다르다 — 이쪽은 산술을 하지 않는 코드라
   * 부호·소수점 개념이 없고, `"12."` 같은 미완성 값도 없다. 그래서 타이핑 버퍼를 두지 않고
   * 매 키 입력이 곧바로 확정값이다. `code` 가 있으면 `type` 은 무시된다.
   */
  code?: CodeKind;

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
  maxIntDigits,
  maxDecimals,
  disabled,
  ...rest
}: {
  value: string;
  onChange: (value: string) => void;
  allowNegative: boolean;
  step?: number;
  maxIntDigits?: number;
  maxDecimals?: number;
  disabled?: boolean;
} & Pick<React.ComponentProps<typeof InputGroupInput>, "id" | "placeholder" | "aria-invalid" | "className">) => {
  const { inputProps, toggleSign } = useNumericInput({
    value, onChange, allowNegative, step, maxIntDigits, maxDecimals, disabled,
  });

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
  maxIntDigits,
  maxDecimals,
  code,
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
      {code && !readOnly ? (
        /*
          자릿수 코드 — 표시는 끊어 보여주고 상태는 숫자만 남긴다.
          미완성 값이 없어 버퍼가 필요 없으므로 `useNumericInput` 을 쓰지 않는다.
        */
        <InputGroupInput
          id={id}
          type="text"
          inputMode={CODE_SPEC[code].inputMode}
          autoComplete="off"
          value={CODE_SPEC[code].format(String(value))}
          onChange={(e) => onChange?.(maskCodeInput(e.target.value, CODE_SPEC[code].digits) as T)}
          placeholder={effectivePlaceholder}
          disabled={disabled}
          aria-invalid={invalid}
          className={cn(hasLabel && LABELED_CONTROL_CLASS)}
        />
      ) : type === "number" && !readOnly ? (
        <NumericGroupInput
          id={id}
          value={String(value)}
          onChange={(v) => onChange?.(v as T)}
          allowNegative={min === undefined || min < 0}
          step={step}
          maxIntDigits={maxIntDigits}
          maxDecimals={maxDecimals}
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
