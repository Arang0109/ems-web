import * as React from "react"
import {
  DayPicker,
  getDefaultClassNames,
  useDayPicker,
  type DayButton,
  type Locale,
  type NavProps,
} from "react-day-picker"
import { ko } from "react-day-picker/locale"

import { cn } from "@/lib/utils"
import { Button } from "@shared/ui/buttons"
import { buttonVariants } from "@shared/ui/buttons"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  locale = ko,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "group/calendar bg-surface p-3 [--cell-radius:var(--radius-button)] [--cell-size:--spacing(9)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      locale={locale}
      formatters={{
        // 로케일 순서를 따르는 제목 — 한국어는 "2026년 7월"
        formatCaption: (date) =>
          date.toLocaleDateString(locale?.code, {
            year: "numeric",
            month: "long",
          }),
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-7 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-7 p-0 select-none aria-disabled:opacity-50",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          // 좌우 각 2개(연/월 이동) 버튼 자리를 비워 둔다
          "flex h-(--cell-size) w-full items-center justify-center px-14",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-body-4",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative rounded-(--cell-radius)",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 bg-surface opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none text-body-4 text-ink",
          captionLayout !== "label" &&
            "flex items-center gap-1 rounded-(--cell-radius) [&>svg]:size-3.5 [&>svg]:text-muted-ink",
          defaultClassNames.caption_label
        ),
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "flex-1 rounded-(--cell-radius) text-label text-muted-ink select-none",
          defaultClassNames.weekday
        ),
        week: cn("mt-2 flex w-full", defaultClassNames.week),
        week_number_header: cn(
          "w-(--cell-size) select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-caption text-muted-ink select-none",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
            : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
          defaultClassNames.day
        ),
        range_start: cn(
          "relative isolate z-0 rounded-l-(--cell-radius) bg-brand-soft after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-brand-soft",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn(
          "relative isolate z-0 rounded-r-(--cell-radius) bg-brand-soft after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-brand-soft",
          defaultClassNames.range_end
        ),
        today: cn(
          "rounded-(--cell-radius) bg-brand-soft text-brand-dark data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-ink aria-selected:text-muted-ink",
          defaultClassNames.outside
        ),
        disabled: cn("text-muted-ink opacity-50", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Nav: (props) => <CalendarNav buttonVariant={buttonVariant} {...props} />,
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon className={cn("size-4", className)} {...props} />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

/** 표시 중인 달을 `offset` 년만큼 옮긴 달 (일자는 1일로 정규화) */
function addYears(month: Date, offset: number) {
  return new Date(month.getFullYear() + offset, month.getMonth(), 1)
}

/**
 * 연·월 이동을 함께 제공하는 내비게이션 — `«  ‹  2026년 7월  ›  »`.
 *
 * 기본 Nav 는 월 이동만 있어 먼 과거·미래 날짜를 고르기 불편하다.
 */
function CalendarNav({
  className,
  onPreviousClick,
  onNextClick,
  previousMonth,
  nextMonth,
  buttonVariant = "ghost",
  ...props
}: NavProps & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const { goToMonth, months, dayPickerProps } = useDayPicker()
  const { startMonth, endMonth } = dayPickerProps

  const displayedMonth = months[0]?.date

  const goToYear = (offset: number) => {
    if (!displayedMonth) return

    let target = addYears(displayedMonth, offset)
    if (startMonth && target < startMonth) target = startMonth
    if (endMonth && target > endMonth) target = endMonth

    goToMonth(target)
  }

  const navButtonClassName = cn(
    buttonVariants({ variant: buttonVariant }),
    "size-7 p-0 select-none disabled:bg-transparent disabled:opacity-50"
  )

  return (
    <nav className={cn(className)} {...props}>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label="이전 연도"
          disabled={!previousMonth}
          onClick={() => goToYear(-1)}
          className={navButtonClassName}
        >
          <ChevronsLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="이전 달"
          disabled={!previousMonth}
          onClick={onPreviousClick}
          className={navButtonClassName}
        >
          <ChevronLeftIcon className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          aria-label="다음 달"
          disabled={!nextMonth}
          onClick={onNextClick}
          className={navButtonClassName}
        >
          <ChevronRightIcon className="size-4" />
        </button>
        <button
          type="button"
          aria-label="다음 연도"
          disabled={!nextMonth}
          onClick={() => goToYear(1)}
          className={navButtonClassName}
        >
          <ChevronsRightIcon className="size-4" />
        </button>
      </div>
    </nav>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 text-body-3 leading-none",
        "group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-brand-primary group-data-[focused=true]/day:ring-3 group-data-[focused=true]/day:ring-brand-primary/25",
        "data-[selected-single=true]:bg-brand-primary data-[selected-single=true]:text-surface",
        "data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-brand-primary data-[range-start=true]:text-surface",
        "data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-brand-primary data-[range-end=true]:text-surface",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-brand-soft data-[range-middle=true]:text-ink",
        "[&>span]:text-caption [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
