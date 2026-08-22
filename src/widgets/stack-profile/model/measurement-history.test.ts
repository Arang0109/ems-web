import { describe, it, expect } from "vitest";

import type { MeasurementRecord } from "@entities/measurement-record";
import {
  ALL_YEARS, filterHistory, formatMeasure, toAllowanceLine, toHistoryItems,
  toHistoryRows, toHistorySeries, toHistoryYears,
} from "./measurement-history";

const record = (over: Partial<MeasurementRecord>): MeasurementRecord => ({
  recordId: 1,
  scheduleId: 10,
  sampledAt: "2026-03-14",
  pollutantId: 100,
  code: "NOX",
  nameKr: "질소산화물",
  cycle: "QUARTERLY",
  periodKey: "2026-Q1",
  periodLabel: "1분기",
  concentration: 12.5,
  unit: "ppm",
  correctedConcentration: 11,
  emission: 3000,
  allowance: 20,
  exceeded: false,
  ...over,
});

describe("formatMeasure", () => {
  it("미량 값을 0 으로 뭉개지 않는다", () => {
    expect(formatMeasure(0.0004)).toBe("0.0004");
  });

  it("값이 없으면 - 로 표기한다", () => {
    expect(formatMeasure(null)).toBe("-");
  });
});

describe("toHistoryYears", () => {
  it("이력에 있는 연도만 최신순으로 준다", () => {
    const records = [
      record({ recordId: 1, sampledAt: "2026-03-14" }),
      record({ recordId: 2, sampledAt: "2024-08-01" }),
      record({ recordId: 3, sampledAt: "2026-09-02" }),
    ];
    expect(toHistoryYears(records)).toEqual([2026, 2024]);
  });
});

describe("toHistoryItems", () => {
  it("같은 항목은 한 번만 남기고 단위를 채운다", () => {
    const records = [
      record({ recordId: 1, pollutantId: 100, unit: null }),
      record({ recordId: 2, pollutantId: 100, unit: "ppm" }),
      record({ recordId: 3, pollutantId: 200, nameKr: "먼지", unit: "mg/S㎥" }),
    ];

    expect(toHistoryItems(records)).toEqual([
      { pollutantId: 200, nameKr: "먼지", unit: "mg/S㎥" },
      { pollutantId: 100, nameKr: "질소산화물", unit: "ppm" },
    ]);
  });
});

describe("filterHistory", () => {
  const records = [
    record({ recordId: 1, sampledAt: "2026-03-14", pollutantId: 100 }),
    record({ recordId: 2, sampledAt: "2025-03-14", pollutantId: 100 }),
    record({ recordId: 3, sampledAt: "2026-06-14", pollutantId: 200 }),
  ];

  it("전체 기간·항목 미지정이면 그대로 둔다", () => {
    expect(filterHistory(records, ALL_YEARS, null)).toHaveLength(3);
  });

  it("연도와 항목으로 함께 좁힌다", () => {
    expect(filterHistory(records, 2026, 100).map((r) => r.recordId)).toEqual([1]);
  });
});

describe("toHistorySeries", () => {
  it("오래된 순으로 뒤집고 x축 표기를 만든다", () => {
    const series = toHistorySeries([
      record({ recordId: 1, sampledAt: "2026-03-14" }),
      record({ recordId: 2, sampledAt: "2025-11-02" }),
    ]);

    expect(series.map((point) => point.label)).toEqual(["25.11.02", "26.03.14"]);
  });

  it("초과 판정은 서버 값을 그대로 쓴다 — null 은 초과가 아니다", () => {
    const series = toHistorySeries([
      record({ recordId: 1, exceeded: null }),
      record({ recordId: 2, sampledAt: "2026-06-14", exceeded: true }),
    ]);

    expect(series.map((point) => point.isExceeded)).toEqual([false, true]);
  });
});

describe("toAllowanceLine", () => {
  it("기준이 하나로 같을 때만 선을 그린다", () => {
    const same = toHistorySeries([record({ recordId: 1, allowance: 20 }), record({ recordId: 2, allowance: 20 })]);
    expect(toAllowanceLine(same)).toBe(20);
  });

  it("회차마다 기준이 다르면 그리지 않는다", () => {
    const mixed = toHistorySeries([record({ recordId: 1, allowance: 20 }), record({ recordId: 2, allowance: 15 })]);
    expect(toAllowanceLine(mixed)).toBeNull();
  });

  it("기준이 하나도 없으면 그리지 않는다", () => {
    expect(toAllowanceLine(toHistorySeries([record({ allowance: null })]))).toBeNull();
  });
});

describe("toHistoryRows", () => {
  it("주기를 레이블로 바꾸고 빈 값을 - 로 굳힌다", () => {
    const [row] = toHistoryRows([record({ emission: null, periodLabel: null })]);

    expect(row.cycle).toBe("분기");
    expect(row.emission).toBe("-");
    expect(row.periodLabel).toBe("-");
  });
});
