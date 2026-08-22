import { describe, expect, it } from "vitest";

import type { AnalysisRecord, MeasurementItemSnapshot } from "@entities/schedule";

import { toAnalysisCreate, toAnalysisRows, toBasicInfoUpdate } from "./mapper";
import { getDefaultAnalysisProgressForm, type AnalysisRowForm } from "./types";
import { validateAnalysisRows } from "./validator";

const item = (pollutantId: number, nameKr: string): MeasurementItemSnapshot => ({
  stackPollutantId: pollutantId + 900,
  pollutantId,
  code: null,
  nameKr,
  nameEn: "",
  field: "AIR",
  method: "FIELD_MEASUREMENT",
  phase: "GAS",
  equipment: "자동가스분석기",
  testMethod: "ES 01301.1",
  cycle: "QUARTERLY",
  allowance: 150,
  oxygenApplicable: true,
});

const record = (pollutantId: number, value: number | null): AnalysisRecord => ({
  id: "analysis-" + pollutantId,
  scheduleId: 1,
  stackPollutantId: pollutantId + 900,
  pollutantId,
  pollutantName: "질소산화물",
  allowance: 150,
  oxygenApplicable: true,
  analysisValue: value,
  unit: "ppm",
  analysisMethod: "자외선형광법",
  analysisEquipment: "NOx 분석기",
  createdAt: "2026-08-18T09:00:00",
  modifiedAt: "2026-08-18T09:00:00",
});

const row = (patch: Partial<AnalysisRowForm> = {}): AnalysisRowForm => ({
  pollutantId: 2,
  analysisId: null,
  pollutantName: "질소산화물",
  allowance: 150,
  oxygenApplicable: true,
  analysisValue: "",
  unit: "",
  analysisMethod: "",
  analysisEquipment: "",
  ...patch,
});

describe("toAnalysisRows", () => {
  it("행은 계획의 측정항목 전체다 — 기록이 없는 항목도 빈 행으로 남는다", () => {
    const rows = toAnalysisRows([item(1, "먼지"), item(2, "질소산화물")], []);

    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.analysisId)).toEqual([null, null]);
    expect(rows[0].pollutantName).toBe("먼지");
  });

  it("측정항목 원장의 시험방법·장비를 초기값으로 채운다", () => {
    const [first] = toAnalysisRows([item(1, "먼지")], []);

    expect(first.analysisMethod).toBe("ES 01301.1");
    expect(first.analysisEquipment).toBe("자동가스분석기");
  });

  it("저장된 기록이 있으면 그 값으로 덮는다", () => {
    const [, second] = toAnalysisRows([item(1, "먼지"), item(2, "질소산화물")], [record(2, 120.5)]);

    expect(second.analysisId).toBe("analysis-2");
    expect(second.analysisValue).toBe("120.5");
    expect(second.unit).toBe("ppm");
  });

  it("허용기준치·산소보정은 원장 스냅샷 값을 그대로 들고 온다", () => {
    const [first] = toAnalysisRows([item(1, "먼지")], []);

    expect(first.allowance).toBe(150);
    expect(first.oxygenApplicable).toBe(true);
  });
});

describe("toAnalysisCreate", () => {
  it("분석값은 숫자로 바꾸고 빈 칸은 null(미입력)로 보낸다", () => {
    const command = toAnalysisCreate(row({ analysisValue: "120.5", unit: " ppm " }));

    expect(command).toEqual({
      pollutantId: 2,
      analysisValue: 120.5,
      unit: "ppm",
      analysisMethod: null,
      analysisEquipment: null,
    });
  });
});

describe("toBasicInfoUpdate", () => {
  it("이 화면이 다루지 않는 필드는 null로 둔다 — 서버가 기존 값을 유지한다", () => {
    const update = toBasicInfoUpdate({
      ...getDefaultAnalysisProgressForm(),
      receivedAt: "2026-08-18",
      analyst: "김분석",
    });

    expect(update.receivedAt).toBe("2026-08-18");
    expect(update.analyst).toBe("김분석");
    expect(update.samplingStartedAt).toBeNull();
    expect(update.facilityManager).toBeNull();
    expect(update.mentorName).toBeNull();
  });
});

describe("validateAnalysisRows", () => {
  it("값만 제대로 들어오면 통과한다", () => {
    expect(validateAnalysisRows([row({ analysisValue: "120" })])).toEqual({});
  });

  it("분석값 없이 단위·방법만 채운 신규 행은 막는다", () => {
    const errors = validateAnalysisRows([row({ unit: "ppm" })]);

    expect(errors[2]).toBe("측정분석값을 입력해주세요.");
  });

  it("저장된 행의 값을 비우면 삭제로 안내한다 — 서버는 null을 기존 값 유지로 읽는다", () => {
    const errors = validateAnalysisRows([row({ analysisId: "analysis-2", analysisValue: "" })]);

    expect(errors[2]).toContain("삭제");
  });

  it("숫자가 아닌 분석값은 막는다", () => {
    const errors = validateAnalysisRows([row({ analysisValue: "12a" })]);

    expect(errors[2]).toBe("측정분석값은 숫자로 입력해주세요.");
  });
});
