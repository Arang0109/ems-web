import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, subDays } from "date-fns";

/**
 * 시작·종료가 모두 확정된 날짜 구간.
 * `react-day-picker` 의 `DateRange` 는 선택 도중 `to` 가 비므로 별도 타입으로 구분한다.
 */
export type DateRangeValue = {
  from: Date;
  to: Date;
};

export const DATE_RANGE_PRESET = ["today", "week", "month", "last30"] as const;

export type DateRangePreset = (typeof DATE_RANGE_PRESET)[number];

/** 주 시작 요일 — 국내 업무 달력 기준 월요일 */
const WEEK_STARTS_ON = 1;

/** 최근 N일 프리셋의 일수 (오늘 포함) */
const RECENT_DAYS = 30;

/** `Date` → `yyyy-MM-dd`. 서버 날짜 문자열과 같은 표현으로 맞춰 시간·타임존 영향을 없앤다. */
export const toDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

/** 프리셋을 기준일(`today`) 기준의 실제 구간으로 변환한다. */
export const toPresetRange = (preset: DateRangePreset, today: Date): DateRangeValue => {
  switch (preset) {
    case "today":
      return { from: today, to: today };
    case "week":
      return {
        from: startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
        to: endOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
      };
    case "month":
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case "last30":
      return { from: subDays(today, RECENT_DAYS - 1), to: today };
  }
};

/**
 * 날짜 문자열이 구간에 포함되는지 판정한다.
 * `value` 는 `yyyy-MM-dd` 또는 서버 LocalDateTime(ISO) 어느 쪽이든 앞 10자리만 본다.
 */
export const isWithinDateRange = (
  value: string | null | undefined,
  range: DateRangeValue,
): boolean => {
  if (!value) return false;

  const key = value.slice(0, 10);
  return key >= toDateKey(range.from) && key <= toDateKey(range.to);
};

export const isSameDateRange = (a: DateRangeValue, b: DateRangeValue): boolean =>
  toDateKey(a.from) === toDateKey(b.from) && toDateKey(a.to) === toDateKey(b.to);

/** 구간이 어떤 프리셋과 일치하는지 — 프리셋 칩의 선택 표시에 쓴다. 일치가 없으면 `null`. */
export const matchDateRangePreset = (
  range: DateRangeValue,
  today: Date,
): DateRangePreset | null =>
  DATE_RANGE_PRESET.find((preset) => isSameDateRange(toPresetRange(preset, today), range)) ?? null;
