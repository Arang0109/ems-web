import type { AnalysisRecord, MeasurementItemSnapshot } from "@entities/schedule";

/**
 * 항목별 실험분석 입력 행.
 *
 * 행의 출처는 <b>계획의 측정항목 스냅샷</b>이다 — 분석 기록이 아직 없는 항목도 빈 행으로 보여야
 * "무엇이 남았는지"가 화면에서 드러난다. 기록이 있는 항목만 나열하면 미입력 항목이 사라진다.
 *
 * `allowance`·`oxygenApplicable`은 측정 시점 원장 사본이라 읽기 전용이며, 입력 대상은
 * 분석값·단위·분석방법·분석장비 넷뿐이다.
 */
export type AnalysisRowForm = {
  pollutantId: number;
  /** 서버에 등록된 분석 기록 id. 아직 등록 전이면 null이다. */
  analysisId: string | null;
  pollutantName: string;
  allowance: number | null;
  oxygenApplicable: boolean;

  analysisValue: string;      // 숫자량이지만 Form 레이어이므로 string
  unit: string;
  analysisMethod: string;
  analysisEquipment: string;
};

/** 분석 진행 정보 — 기본정보(PATCH basic-info) 중 분석 단계에서 채우는 값만 추린다. */
export type AnalysisProgressForm = {
  receivedAt: string;         // "yyyy-MM-dd" — 입력되면 서버가 '분석값입력중'으로 전진시킨다
  analyzedAt: string;
  issuedAt: string;
  analyst: string;            // 시료분석검사자
  technicalManager: string;   // 기술책임자
};

export const getDefaultAnalysisProgressForm = (): AnalysisProgressForm => ({
  receivedAt: "", analyzedAt: "", issuedAt: "", analyst: "", technicalManager: "",
});

/** 행에 입력값이 하나라도 있는지 — 저장 대상 판정에 쓴다. */
export const hasAnalysisInput = (row: AnalysisRowForm): boolean =>
  row.analysisValue.trim() !== "";

/** 스냅샷 측정항목만으로 만든 빈 행(아직 분석 기록이 없는 항목). */
export const toEmptyRow = (item: MeasurementItemSnapshot): AnalysisRowForm => ({
  pollutantId: item.pollutantId,
  analysisId: null,
  pollutantName: item.nameKr,
  allowance: item.allowance,
  oxygenApplicable: item.oxygenApplicable,
  analysisValue: "",
  // 분석방법·장비는 측정항목 원장에 이미 있는 값이라 초기값으로 채운다. 실제 분석에서 달라졌으면 고쳐 저장한다.
  unit: "",
  analysisMethod: item.testMethod ?? "",
  analysisEquipment: item.equipment ?? "",
});

/** 서버 기록을 행으로 되돌린다(저장 직후 폼 동기화·재조회 공통). */
export const toSavedRow = (row: AnalysisRowForm, record: AnalysisRecord): AnalysisRowForm => ({
  ...row,
  analysisId: record.id,
  allowance: record.allowance,
  oxygenApplicable: record.oxygenApplicable,
  analysisValue: record.analysisValue === null ? "" : String(record.analysisValue),
  unit: record.unit ?? "",
  analysisMethod: record.analysisMethod ?? "",
  analysisEquipment: record.analysisEquipment ?? "",
});
