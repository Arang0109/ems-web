import { describe, expect, it } from "vitest";

import {
  fromDateKey,
  isSameDateRange,
  isWithinDateRange,
  matchDateRangePreset,
  toDateKey,
  toPresetRange,
} from "./date-range";

/** 기준일 — 2026-08-11(화). 주(월~일)는 8/10~8/16, 달은 8/1~8/31 이다. */
const TODAY = new Date(2026, 7, 11);

describe("toPresetRange", () => {
  it("today 는 기준일 하루 구간이다", () => {
    const range = toPresetRange("today", TODAY);

    expect(toDateKey(range.from)).toBe("2026-08-11");
    expect(toDateKey(range.to)).toBe("2026-08-11");
  });

  it("week 는 월요일에 시작해 일요일에 끝난다", () => {
    const range = toPresetRange("week", TODAY);

    expect(toDateKey(range.from)).toBe("2026-08-10");
    expect(toDateKey(range.to)).toBe("2026-08-16");
  });

  it("month 는 해당 월의 1일부터 말일까지다", () => {
    const range = toPresetRange("month", TODAY);

    expect(toDateKey(range.from)).toBe("2026-08-01");
    expect(toDateKey(range.to)).toBe("2026-08-31");
  });

  it("around30 은 기준일 전후 30일 구간이다", () => {
    const range = toPresetRange("around30", TODAY);

    expect(toDateKey(range.from)).toBe("2026-07-12");
    expect(toDateKey(range.to)).toBe("2026-09-10");
  });
});

describe("isWithinDateRange", () => {
  const range = toPresetRange("week", TODAY); // 2026-08-10 ~ 2026-08-16

  it("경계일을 포함한다", () => {
    expect(isWithinDateRange("2026-08-10", range)).toBe(true);
    expect(isWithinDateRange("2026-08-16", range)).toBe(true);
  });

  it("구간 밖이면 false 다", () => {
    expect(isWithinDateRange("2026-08-09", range)).toBe(false);
    expect(isWithinDateRange("2026-08-17", range)).toBe(false);
  });

  it("서버 LocalDateTime 문자열은 날짜 부분만 본다", () => {
    expect(isWithinDateRange("2026-08-16T23:30:00", range)).toBe(true);
    expect(isWithinDateRange("2026-08-17T00:00:00", range)).toBe(false);
  });

  it("빈 값은 포함하지 않는다", () => {
    expect(isWithinDateRange(null, range)).toBe(false);
    expect(isWithinDateRange(undefined, range)).toBe(false);
    expect(isWithinDateRange("", range)).toBe(false);
  });
});

describe("isSameDateRange", () => {
  it("시각이 달라도 날짜가 같으면 같은 구간이다", () => {
    const a = { from: new Date(2026, 7, 11, 0, 0), to: new Date(2026, 7, 11, 23, 59) };
    const b = { from: new Date(2026, 7, 11, 9, 30), to: new Date(2026, 7, 11, 18, 0) };

    expect(isSameDateRange(a, b)).toBe(true);
  });

  it("날짜가 다르면 다른 구간이다", () => {
    const a = toPresetRange("today", TODAY);
    const b = toPresetRange("week", TODAY);

    expect(isSameDateRange(a, b)).toBe(false);
  });
});

describe("matchDateRangePreset", () => {
  it("프리셋과 일치하는 구간은 해당 프리셋을 돌려준다", () => {
    expect(matchDateRangePreset(toPresetRange("today", TODAY), TODAY)).toBe("today");
    expect(matchDateRangePreset(toPresetRange("month", TODAY), TODAY)).toBe("month");
  });

  it("직접 고른 구간은 일치하는 프리셋이 없다", () => {
    const custom = { from: new Date(2026, 7, 3), to: new Date(2026, 7, 7) };

    expect(matchDateRangePreset(custom, TODAY)).toBeNull();
  });
});

describe("fromDateKey", () => {
  it("toDateKey 의 역방향이다", () => {
    const parsed = fromDateKey("2026-08-11");

    expect(parsed).not.toBeNull();
    expect(toDateKey(parsed!)).toBe("2026-08-11");
  });

  it("UTC 가 아니라 로컬 자정으로 읽는다", () => {
    const parsed = fromDateKey("2026-08-11")!;

    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(11);
    expect(parsed.getHours()).toBe(0);
  });

  it("실재하지 않는 날짜는 null 이다 — 다음 달로 굴러가지 않는다", () => {
    expect(fromDateKey("2026-02-31")).toBeNull();
    expect(fromDateKey("2026-13-01")).toBeNull();
  });

  it("자릿수를 채우지 않은 표기는 null 이다", () => {
    expect(fromDateKey("2026-8-1")).toBeNull();
  });

  it("날짜가 아닌 값은 null 이다", () => {
    expect(fromDateKey("abc")).toBeNull();
    expect(fromDateKey("")).toBeNull();
    expect(fromDateKey(null)).toBeNull();
    expect(fromDateKey(undefined)).toBeNull();
  });

  it("시각이 붙은 문자열은 날짜 키가 아니므로 null 이다", () => {
    expect(fromDateKey("2026-08-11T09:00:00")).toBeNull();
  });
});
