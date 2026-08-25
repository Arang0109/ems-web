import { describe, expect, it } from "vitest";

import { toDateKey, toPresetRange } from "@shared/lib";

import {
  ALL_STATUSES,
  ALL_TEAMS,
  readFilterParams,
  writeFilterParams,
  type ScheduleFilterDefaults,
  type ScheduleFilterValues,
} from "./filter-params";

/** 기준일 — 2026-08-11(화) */
const TODAY = new Date(2026, 7, 11);

const defaults: ScheduleFilterDefaults = {
  range: toPresetRange("today", TODAY),
  teamId: "3",
};

const read = (query: string) => readFilterParams(new URLSearchParams(query), defaults);

const rangeKeys = (values: ScheduleFilterValues) => [
  toDateKey(values.range.from),
  toDateKey(values.range.to),
];

describe("readFilterParams", () => {
  it("파라미터가 없으면 전부 기본값이다", () => {
    const values = read("");

    expect(rangeKeys(values)).toEqual(["2026-08-11", "2026-08-11"]);
    expect(values.teamId).toBe("3");
    expect(values.status).toBe(ALL_STATUSES);
    expect(values.pageIndex).toBe(0);
  });

  it("정상 쿼리를 그대로 읽는다", () => {
    const values = read("from=2026-08-01&to=2026-08-31&team=7&status=MEASURING&page=3");

    expect(rangeKeys(values)).toEqual(["2026-08-01", "2026-08-31"]);
    expect(values.teamId).toBe("7");
    expect(values.status).toBe("MEASURING");
    expect(values.pageIndex).toBe(2);
  });

  it("team=all 은 키 부재(내 팀)와 구분된다", () => {
    expect(read("team=all").teamId).toBe(ALL_TEAMS);
    expect(read("").teamId).toBe("3");
  });

  describe("기간 방어", () => {
    it("한쪽만 있으면 구간 전체를 기본값으로 되돌린다", () => {
      expect(rangeKeys(read("from=2026-08-01"))).toEqual(["2026-08-11", "2026-08-11"]);
      expect(rangeKeys(read("to=2026-08-31"))).toEqual(["2026-08-11", "2026-08-11"]);
    });

    it("파싱할 수 없는 날짜는 기본값으로 떨어진다", () => {
      expect(rangeKeys(read("from=2026-13-99&to=2026-08-31"))).toEqual([
        "2026-08-11",
        "2026-08-11",
      ]);
      expect(rangeKeys(read("from=abc&to=def"))).toEqual(["2026-08-11", "2026-08-11"]);
    });

    it("뒤집힌 구간은 바로잡는다", () => {
      expect(rangeKeys(read("from=2026-08-31&to=2026-08-01"))).toEqual([
        "2026-08-01",
        "2026-08-31",
      ]);
    });
  });

  describe("상태 방어", () => {
    it("선택지 밖의 값은 전체로 떨어진다", () => {
      expect(read("status=UNKNOWN").status).toBe(ALL_STATUSES);
    });

    it("취소는 이 목록의 선택지가 아니므로 전체로 떨어진다", () => {
      expect(read("status=CANCELED").status).toBe(ALL_STATUSES);
    });
  });

  describe("페이지 방어", () => {
    it("숫자가 아니거나 1 미만이면 첫 페이지다", () => {
      expect(read("page=abc").pageIndex).toBe(0);
      expect(read("page=0").pageIndex).toBe(0);
      expect(read("page=-2").pageIndex).toBe(0);
      expect(read("page=1.5").pageIndex).toBe(0);
      expect(read("page=").pageIndex).toBe(0);
    });

    it("쿼리는 1-based, 값은 0-based 다", () => {
      expect(read("page=1").pageIndex).toBe(0);
      expect(read("page=10").pageIndex).toBe(9);
    });
  });
});

describe("writeFilterParams", () => {
  const write = (values: ScheduleFilterValues, query = "") =>
    writeFilterParams(new URLSearchParams(query), values, defaults).toString();

  const base: ScheduleFilterValues = {
    range: defaults.range,
    teamId: defaults.teamId,
    status: ALL_STATUSES,
    pageIndex: 0,
  };

  it("기본 기간·전체 상태·첫 페이지는 파라미터를 남기지 않는다", () => {
    expect(write(base)).toBe("team=3");
  });

  it("팀은 기본값과 같아도 항상 명시한다 — 보는 사람에 따라 목록이 달라지면 안 된다", () => {
    expect(write({ ...base, teamId: ALL_TEAMS })).toBe("team=all");
  });

  it("기본값과 다른 조건만 파라미터로 나간다", () => {
    const values: ScheduleFilterValues = {
      range: { from: new Date(2026, 7, 1), to: new Date(2026, 7, 31) },
      teamId: "7",
      status: "MEASURING",
      pageIndex: 2,
    };

    expect(write(values)).toBe("from=2026-08-01&to=2026-08-31&team=7&status=MEASURING&page=3");
  });

  it("필터와 무관한 파라미터는 건드리지 않는다", () => {
    expect(write(base, "tab=summary")).toContain("tab=summary");
  });

  it("기본값으로 되돌리면 파라미터가 지워진다", () => {
    expect(write(base, "from=2026-08-01&to=2026-08-31&status=MEASURING&page=3")).toBe("team=3");
  });
});

describe("read ∘ write 왕복", () => {
  it("쓴 값을 그대로 다시 읽는다", () => {
    const cases: ScheduleFilterValues[] = [
      { range: defaults.range, teamId: defaults.teamId, status: ALL_STATUSES, pageIndex: 0 },
      { range: defaults.range, teamId: ALL_TEAMS, status: "SCHEDULED", pageIndex: 4 },
      {
        range: { from: new Date(2026, 6, 12), to: new Date(2026, 8, 10) },
        teamId: "7",
        status: "REPORT_COMPLETED",
        pageIndex: 1,
      },
    ];

    for (const values of cases) {
      const restored = readFilterParams(
        writeFilterParams(new URLSearchParams(), values, defaults),
        defaults,
      );

      expect(rangeKeys(restored)).toEqual(rangeKeys(values));
      expect(restored.teamId).toBe(values.teamId);
      expect(restored.status).toBe(values.status);
      expect(restored.pageIndex).toBe(values.pageIndex);
    }
  });
});
