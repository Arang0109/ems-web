import { describe, expect, it } from "vitest";

import type { AnalysisRecord, MeasurementItemSnapshot } from "@entities/schedule";

import {
  toAnalysisResultsSave, toAnalysisRows, toBasicInfoUpdate, toSamplingTimesSave,
} from "./mapper";
import {
  getDefaultAnalysisProgressForm, isResultChanged, isSamplingTimeChanged,
  type AnalysisRowForm,
} from "./types";
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

const record = (
  pollutantId: number, value: number | null,
  times: { startedAt?: string | null; endedAt?: string | null } = {},
): AnalysisRecord => ({
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
  // 같은 문서의 칸이지만 저장 경로가 갈라진다 — 표는 함께 그리고 요청만 나눈다
  samplingStartedAt: times.startedAt ?? null,
  samplingEndedAt: times.endedAt ?? null,
  createdAt: "2026-08-18T09:00:00",
  modifiedAt: "2026-08-18T09:00:00",
});

const row = (patch: Partial<AnalysisRowForm> = {}): AnalysisRowForm => ({
  pollutantId: 2,
  analysisId: null,
  hasSavedValue: false,
  pollutantName: "질소산화물",
  allowance: 150,
  oxygenApplicable: true,
  samplingStartedAt: "",
  samplingEndedAt: "",
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
    // 서버는 단위를 자유 문자열로 들고 있어 예전 기록에는 표기가 그대로다 — Select 값으로 되돌린다
    expect(second.unit).toBe("PPM");
  });

  it("허용기준치·산소보정은 원장 스냅샷 값을 그대로 들고 온다", () => {
    const [first] = toAnalysisRows([item(1, "먼지")], []);

    expect(first.allowance).toBe(150);
    expect(first.oxygenApplicable).toBe(true);
  });

  it("채취시각도 같은 행에 담는다 — 서버 형식(HH:mm:ss)을 입력 형식(HH:mm)으로 줄인다", () => {
    const [first] = toAnalysisRows(
      [item(1, "먼지")],
      [record(1, null, { startedAt: "09:30:00", endedAt: "10:00:00" })],
    );

    expect(first.samplingStartedAt).toBe("09:30");
    expect(first.samplingEndedAt).toBe("10:00");
  });

  it("채취시각만 저장된 문서는 분석값을 넣은 적이 없는 행이다", () => {
    // `analysisId` 로 갈음하면 이 행이 "저장된 값을 비웠다"로 잡혀 검증에서 막힌다
    const [first] = toAnalysisRows([item(1, "먼지")], [record(1, null, { startedAt: "09:30:00" })]);

    expect(first.analysisId).not.toBeNull();
    expect(first.hasSavedValue).toBe(false);
  });
});

describe("toAnalysisResultsSave", () => {
  it("분석값은 숫자로 바꾸고 빈 칸은 null(미입력)로 보낸다", () => {
    const save = toAnalysisResultsSave([row({ analysisValue: "120.5", unit: "PPM" })]);

    expect(save.items).toEqual([{
      pollutantId: 2,
      analysisValue: 120.5,
      unit: "PPM",
      analysisMethod: null,
      analysisEquipment: null,
    }]);
  });

  it("문서 id를 담지 않는다 — 측정물질을 키로 upsert 하므로 신규·기존을 가릴 필요가 없다", () => {
    // 성적서 탭이 채취시간을 먼저 저장해 문서를 만들어 두어도 이 화면은 그 사실을 몰라도 된다
    const save = toAnalysisResultsSave([row({ analysisId: "analysis-2", analysisValue: "120.5" })]);

    expect(save.items[0]).not.toHaveProperty("analysisId");
    expect(save.items[0].pollutantId).toBe(2);
  });

  it("넘긴 행만 담는다 — 호출부가 기준선과 달라진 행만 넘긴다", () => {
    const save = toAnalysisResultsSave([row({ pollutantId: 1, analysisValue: "10" })]);

    expect(save.items.map((i) => i.pollutantId)).toEqual([1]);
  });
});

describe("isResultChanged", () => {
  // 이 판정이 곧 저장 요청에 담기는 행이다 — 넓게 잡으면 새 회차에 이전 회차와 같은 기록이 생긴다.
  it("원장 초기값만 들어 있는 행은 저장 대상이 아니다", () => {
    const untouched = row({ analysisMethod: "ES 01301.1", analysisEquipment: "자동가스분석기" });

    expect(isResultChanged(untouched, { ...untouched })).toBe(false);
  });

  it("한 칸이라도 기준선과 다르면 저장 대상이다", () => {
    const baseline = row({ analysisMethod: "ES 01301.1" });

    expect(isResultChanged({ ...baseline, analysisValue: "10" }, baseline)).toBe(true);
    expect(isResultChanged({ ...baseline, unit: "PPM" }, baseline)).toBe(true);
    // 채웠던 칸을 비운 것도 변경이다 — 서버가 빈 값을 "지웠다"로 읽는다
    expect(isResultChanged({ ...baseline, analysisMethod: "" }, baseline)).toBe(true);
  });

  it("기준선이 없으면 분석값이 들어온 행만 저장 대상이다", () => {
    // 측정항목이 교체돼 기준선 배열이 짧아진 경우 — 초기값뿐인 행까지 저장하면 안 된다
    expect(isResultChanged(row({ analysisMethod: "ES 01301.1" }), undefined)).toBe(false);
    expect(isResultChanged(row({ analysisValue: "10" }), undefined)).toBe(true);
  });
});

describe("isSamplingTimeChanged", () => {
  it("시각을 비운 것도 변경이다 — 서버가 빈 값을 '지웠다'로 읽는다", () => {
    const baseline = row({ samplingStartedAt: "09:30" });

    expect(isSamplingTimeChanged({ ...baseline, samplingStartedAt: "" }, baseline)).toBe(true);
    expect(isSamplingTimeChanged({ ...baseline }, baseline)).toBe(false);
  });
});

describe("toSamplingTimesSave", () => {
  it("입력 형식(HH:mm)을 서버 형식으로 되돌리고 빈 칸은 null(지웠다)로 보낸다", () => {
    const save = toSamplingTimesSave([row({ samplingStartedAt: "09:30" })]);

    expect(save.items).toEqual([{
      pollutantId: 2,
      samplingStartedAt: "09:30:00",
      samplingEndedAt: null,
    }]);
  });

  it("실험실 입력값은 담지 않는다 — 서버가 그 칸의 소유를 다른 경로에 두었다", () => {
    const save = toSamplingTimesSave([row({ analysisValue: "120.5", unit: "PPM" })]);

    expect(save.items[0]).not.toHaveProperty("analysisValue");
    expect(save.items[0]).not.toHaveProperty("unit");
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
    const errors = validateAnalysisRows([row({ unit: "PPM" })]);

    expect(errors[2]).toBe("측정분석값을 입력해주세요.");
  });

  it("저장된 값을 비우면 삭제로 안내한다 — 서버는 null을 기존 값 유지로 읽는다", () => {
    const errors = validateAnalysisRows([
      row({ analysisId: "analysis-2", hasSavedValue: true, analysisValue: "" }),
    ]);

    expect(errors[2]).toContain("삭제");
  });

  it("채취시각만 저장된 행의 빈 분석값은 막지 않는다 — 아직 넣은 적 없는 값이다", () => {
    const errors = validateAnalysisRows([
      row({ analysisId: "analysis-2", hasSavedValue: false, samplingStartedAt: "09:30" }),
    ]);

    expect(errors).toEqual({});
  });

  it("숫자가 아닌 분석값은 막는다", () => {
    const errors = validateAnalysisRows([row({ analysisValue: "12a" })]);

    expect(errors[2]).toBe("측정분석값은 숫자로 입력해주세요.");
  });
});
