import React from "react";

import { Field, FieldDescription } from "@shared/ui/primitives";

import { InFieldLabel } from "./InFieldLabel";
import { isFieldInvalid, type FieldErrorProps } from "./field-error";

/** 칸 아래 안내·에러 문구. 둘 다 있으면 안내 → 에러 순으로 쌓는다 */
export const FieldMessages = ({ helperText, errorMessage }: { helperText?: string; errorMessage?: string }) => (
  <>
    {helperText && <FieldDescription>{helperText}</FieldDescription>}
    {errorMessage && <FieldDescription className="text-danger">{errorMessage}</FieldDescription>}
  </>
);

interface Props extends FieldErrorProps {
  id?: string;
  label: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  /** 라벨 글줄 시작점 — 컨트롤의 좌패딩에 맞춘다. 기본 `left-2.5` */
  labelClassName?: string;
  /** 칸 자체. 라벨이 그 위에 얹힌다 */
  children: React.ReactNode;
}

/**
 * 인필드 라벨 필드의 껍데기 — 라벨(칸 안 좌상단) + 칸 + 안내/에러 문구.
 *
 * Select·MultiSelect·DatePicker·DateRangePicker·Textarea·InputGroup 이 같은 틀을 쓴다.
 * 여섯 벌로 복사돼 있던 것을 여기로 모았다 — 에러 표시 규칙이 한 곳에서만 정해진다.
 */
export const InFieldShell = ({
  id,
  label,
  required,
  disabled,
  helperText,
  errorMessage,
  invalid,
  labelClassName = "left-2.5",
  children,
}: Props) => {
  const isInvalid = isFieldInvalid({ errorMessage, invalid });

  return (
    <Field data-invalid={isInvalid || undefined} className="gap-1.5">
      <div className="relative">
        <InFieldLabel
          htmlFor={id}
          required={required}
          invalid={isInvalid}
          disabled={disabled}
          className={labelClassName}
        >
          {label}
        </InFieldLabel>
        {children}
      </div>
      <FieldMessages helperText={helperText} errorMessage={errorMessage} />
    </Field>
  );
};
