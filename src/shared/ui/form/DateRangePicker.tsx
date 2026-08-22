import React from "react";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@shared/ui/buttons";
import { Calendar } from "@shared/ui/primitives";
import { Field, FieldLabel, FieldDescription } from "@shared/ui/primitives";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type { DateRange };

interface Props {
  id?: string;
  label?: React.ReactNode;
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  className?: string;
  /**
   * 트리거 버튼 없이 달력을 그대로 펼친다.
   * 이미 팝오버 안에 놓이는 경우(필터 팝오버 등) 팝오버 중첩을 피한다.
   */
  inline?: boolean;
  /** 한 번에 보여줄 개월 수. 기본은 트리거형 2개월, `inline` 은 1개월 */
  numberOfMonths?: number;
}

/** `DatePicker` 의 기간(from~to) 버전. 트리거 라벨은 `2026.01.01 → 2026.12.31` 형식. */
export const DateRangePicker = ({
  id,
  label,
  value,
  onChange,
  placeholder = "기간을 선택하세요",
  disabled = false,
  required,
  helperText,
  className,
  inline = false,
  numberOfMonths,
}: Props) => {
  const [open, setOpen] = React.useState(false);

  const calendar = (
    <Calendar
      mode="range"
      numberOfMonths={numberOfMonths ?? (inline ? 1 : 2)}
      selected={value}
      onSelect={onChange}
      defaultMonth={value?.from}
      disabled={disabled}
    />
  );

  const picker = inline ? (
    <div className={cn("rounded-panel border border-rule", className)}>{calendar}</div>
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "justify-between gap-3 font-normal",
              !value?.from && "text-muted-ink",
              className
            )}
          >
            {value?.from ? (
              <span className="flex items-center gap-1.5">
                {format(value.from, "yyyy.MM.dd")}
                <span className="text-muted-ink">→</span>
                {value.to ? format(value.to, "yyyy.MM.dd") : "…"}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
            <CalendarDays size={19} />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="end">
        {calendar}
      </PopoverContent>
    </Popover>
  );

  if (!label) return picker;

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </FieldLabel>
      {picker}
      {helperText && <FieldDescription>{helperText}</FieldDescription>}
    </Field>
  );
};
