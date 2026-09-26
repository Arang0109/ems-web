import React from "react";
import { CalendarIcon } from "lucide-react";

import { toDateKey } from "@shared/lib";
import { Button } from "@shared/ui/buttons";
import { Calendar } from "@shared/ui/primitives";
import { PopoverRoot, PopoverContent, PopoverTrigger } from "../popover";
import { cn } from "@/lib/utils";

import { InFieldShell } from "./InFieldShell";
import { isFieldInvalid, type FieldErrorProps } from "./field-error";
import {
  IN_FIELD_CONTROL_HEIGHT,
  IN_FIELD_ICON_CLASS,
  IN_FIELD_VALUE_CLASS,
  inFieldPlaceholder,
} from "./in-field";

interface DatePickerProps extends FieldErrorProps {
  id?: string;
  label?: React.ReactNode;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
}

export const DatePicker = ({
  id,
  label,
  value,
  onChange,
  placeholder = "날짜를 선택하세요",
  disabled = false,
  required,
  helperText,
  errorMessage,
  invalid: invalidProp,
  className,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const hasLabel = !!label;
  const invalid = isFieldInvalid({ errorMessage, invalid: invalidProp });
  const effectivePlaceholder = hasLabel ? inFieldPlaceholder(placeholder, label) : placeholder;

  const picker = (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid || undefined}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-ink",
              // 라벨이 칸 안에 들어오면 달력 아이콘은 우측으로 옮겨 세로 중앙에 고정한다 —
              // 좌측에 두면 라벨 시작점까지 아이콘 폭만큼 밀려 다른 인필드 칸과 글줄이 어긋난다
              hasLabel && cn("relative pl-2.5 pr-9", IN_FIELD_CONTROL_HEIGHT, IN_FIELD_VALUE_CLASS),
              className
            )}
          >
            {!hasLabel && <CalendarIcon className="mr-2 size-4" />}
            {value ? toDateKey(value) : <span>{effectivePlaceholder}</span>}
            {hasLabel && <CalendarIcon className={cn("size-4 text-muted-ink", IN_FIELD_ICON_CLASS)} />}
          </Button>
        }
      />
      <PopoverContent className="p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange?.(date);
            setOpen(false);
          }}
          defaultMonth={value}
        />
      </PopoverContent>
    </PopoverRoot>
  );

  if (!hasLabel) return picker;

  return (
    <InFieldShell
      id={id}
      label={label}
      required={required}
      disabled={disabled}
      helperText={helperText}
      errorMessage={errorMessage}
      invalid={invalid}
    >
      {picker}
    </InFieldShell>
  );
};
