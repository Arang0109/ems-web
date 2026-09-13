import React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@shared/ui/buttons";
import { Calendar } from "@shared/ui/primitives";
import { Field, FieldDescription } from "@shared/ui/primitives";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { InFieldLabel } from "./InFieldLabel";
import {
  IN_FIELD_CONTROL_HEIGHT,
  IN_FIELD_ICON_CLASS,
  IN_FIELD_VALUE_CLASS,
  inFieldPlaceholder,
} from "./in-field";

interface DatePickerProps {
  id?: string;
  label?: React.ReactNode;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
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
  className,
}: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const hasLabel = !!label;
  const invalid = !!errorMessage;
  const effectivePlaceholder = hasLabel ? inFieldPlaceholder(placeholder, label) : placeholder;

  const picker = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            aria-invalid={invalid || undefined}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              // 라벨이 칸 안에 들어오면 달력 아이콘은 우측으로 옮겨 세로 중앙에 고정한다 —
              // 좌측에 두면 라벨 시작점까지 아이콘 폭만큼 밀려 다른 인필드 칸과 글줄이 어긋난다
              hasLabel && cn("relative pl-2.5 pr-9", IN_FIELD_CONTROL_HEIGHT, IN_FIELD_VALUE_CLASS),
              className
            )}
          >
            {!hasLabel && <CalendarIcon className="mr-2 size-4" />}
            {value ? format(value, "yyyy-MM-dd") : <span>{effectivePlaceholder}</span>}
            {hasLabel && <CalendarIcon className={cn("size-4 text-muted-foreground", IN_FIELD_ICON_CLASS)} />}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
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
    </Popover>
  );

  if (!hasLabel) return picker;

  return (
    <Field data-invalid={invalid || undefined} className="gap-1.5">
      <div className="relative">
        <InFieldLabel
          htmlFor={id}
          required={required}
          invalid={invalid}
          disabled={disabled}
          className="left-2.5"
        >
          {label}
        </InFieldLabel>
        {picker}
      </div>
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
      {errorMessage && <FieldDescription className="text-destructive">{errorMessage}</FieldDescription>}
    </Field>
  );
};
