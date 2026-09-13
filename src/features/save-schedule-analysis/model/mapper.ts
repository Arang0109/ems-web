import type {
  AnalysisResult, AnalysisResultsSave, SamplingTimesSave,
  ReportDatesUpdate, TenantSnapshotUpdate, MeasurementItemSnapshot, ScheduleDetail,
} from "@entities/schedule";
import { toNumberOrNull, trimValue, unformatTime } from "@shared/lib";

import {
  getDefaultAnalysisProgressForm, toEmptyRow, toSavedRow,
  type AnalysisProgressForm, type AnalysisRowForm,
} from "./types";

/**
 * 계획의 측정항목 + 저장된 분석 기록 → 입력 행 목록.
 * 항목 순서는 스냅샷을 따른다 — 측정정보 탭의 측정항목 순서와 어긋나면 대조가 어렵다.
 */
export const toAnalysisRows = (
  items: MeasurementItemSnapshot[],
  results: AnalysisResult[],
): AnalysisRowForm[] => {
  const resultByPollutantId = new Map(results.map((result) => [result.pollutantId, result]));

  return items.map((item) => {
    const empty = toEmptyRow(item);
    const result = resultByPollutantId.get(item.pollutantId);
    return result ? toSavedRow(empty, result) : empty;
  });
};

/**
 * 실험실 입력값의 저장 요청으로 바꾼다. 측정물질을 키로 upsert 하므로
 * 신규·기존을 가릴 필요가 없다.
 *
 * 비운 칸은 null 로 보내며 서버는 이를 "지웠다"로 읽는다. 빈 문자열을 그대로 저장하면
 * "입력했는데 공백"이 되어 미입력과 구분되지 않는다.
 *
 * <b>넘긴 행만 요청에 담긴다.</b> 호출부는 표 전체가 아니라 기준선과 달라진 행만 넘긴다 —
 * 빈 행에도 측정항목 원장의 분석방법·장비가 초기값으로 들어 있어, 전부 보내면 손대지 않은
 * 항목까지 서버에 기록이 생긴다(`useScheduleAnalysis`).
 */
export const toAnalysisResultsSave = (rows: AnalysisRowForm[]): AnalysisResultsSave => ({
  items: rows.map((row) => ({
    pollutantId: row.pollutantId,
    analysisValue: toNumberOrNull(row.analysisValue),
    unit: emptyToNull(row.unit),
    analysisMethod: emptyToNull(row.analysisMethod),
    analysisEquipment: emptyToNull(row.analysisEquipment),
  })),
});

/**
 * 채취시간의 저장 요청으로 바꾼다. 같은 행의 실험실 입력값과 <b>경로가 갈라지는</b> 이유는
 * 서버가 두 필드군의 소유를 나눠 두었기 때문이다 — 이 요청은 시각만 갈아끼우고
 * 분석값·단위·방법·장비는 건드리지 않는다.
 *
 * 비운 칸은 null 로 보내며 서버는 이를 "지웠다"로 읽는다 — 표 전체를 보내므로
 * 빈 칸은 "미전달"이 아니라 "지웠다"는 뜻이다.
 */
export const toSamplingTimesSave = (rows: AnalysisRowForm[]): SamplingTimesSave => ({
  items: rows.map((row) => ({
    pollutantId: row.pollutantId,
    samplingStartedAt: unformatTime(row.samplingStartedAt),
    samplingEndedAt: unformatTime(row.samplingEndedAt),
  })),
});

/**
 * 진행 정보의 출처가 둘로 갈린다 — 일자 셋은 계획 메타(응답 최상위)가, 서명란 담당자 둘은
 * 고객사 스냅샷(snapshot.tenant)이 갖는다. 한 폼이지만 소유가 갈려 저장은 두 경로로 나간다.
 */
export const fromBasicInfo = (schedule: ScheduleDetail | null): AnalysisProgressForm => {
  if (!schedule) return getDefaultAnalysisProgressForm();
  return {
    receivedAt: schedule.receivedAt ?? "",
    analyzedAt: schedule.analyzedAt ?? "",
    issuedAt: schedule.issuedAt ?? "",
    analyst: schedule.snapshot?.tenant?.analyst ?? "",
    technicalManager: schedule.snapshot?.tenant?.technicalManager ?? "",
  };
};

/**
 * 분석 진행 정보 → 성적서 진행 일자 수정 입력.
 * 이 탭이 일자 셋을 단독으로 소유하므로 빈 칸을 null 그대로 실어 보낸다 — 서버가 값을 지운다.
 * 그래서 잘못 넣은 일자를 되돌릴 수 있다.
 */
export const toReportDatesUpdate = (form: AnalysisProgressForm): ReportDatesUpdate => ({
  receivedAt: emptyToNull(form.receivedAt),
  analyzedAt: emptyToNull(form.analyzedAt),
  issuedAt: emptyToNull(form.issuedAt),
});

/**
 * 분석 진행 정보 → 고객사 스냅샷 수정 입력.
 * 서명란 담당자는 현장 채취 탭과 공유하는 값이라 부분 갱신이다 — 이 화면이 다루지 않는 필드는
 * 키 자체를 두지 않아 서버가 기존 값을 유지한다.
 */
export const toTenantSnapshotUpdate = (form: AnalysisProgressForm): TenantSnapshotUpdate => ({
  analyst: emptyToNull(form.analyst),
  technicalManager: emptyToNull(form.technicalManager),
});

const emptyToNull = (value: string): string | null => trimValue(value) || null;
