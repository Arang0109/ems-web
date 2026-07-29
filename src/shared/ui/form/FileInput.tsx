import React, { useRef } from "react";
import { X } from "lucide-react";

import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface Props {
  id?: string;
  label?: React.ReactNode;

  file: File | null;
  onChange: (file: File | null) => void;

  accept?: string;
  buttonLabel?: string;
  placeholder?: string;

  disabled?: boolean;
  required?: boolean;
  helperText?: string;

  isInvalid?: boolean;
}

// 파일 선택 입력. <input type="file">은 보안상 값을 코드로 지정할 수 없어
// 실제 input은 숨기고, 선택된 File은 부모가 state로 들고 이 컴포넌트는 표시만 담당한다.
export const FileInput = ({
  id,
  label,
  file,
  onChange,
  accept,
  buttonLabel = "파일 선택",
  placeholder = "선택된 파일이 없습니다.",
  disabled = false,
  required,
  helperText,
  isInvalid,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.files?.[0] ?? null);
    // 같은 파일을 다시 골라도 change가 발생하도록 input 값을 비운다.
    e.target.value = "";
  };

  return (
    <Field data-invalid={isInvalid || undefined}>
      {label && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </FieldLabel>
      )}

      <div className="flex items-center gap-2">
        {/* form 안에서 쓰이므로 type="button"을 명시한다(미지정 시 기본값이 submit). */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {buttonLabel}
        </Button>

        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          {file?.name ?? placeholder}
        </span>

        {file && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label="선택한 파일 제거"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
