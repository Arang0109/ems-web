import type {
  AnalysisRecord, AnalysisRecordCreate, AnalysisRecordUpdate,
  BasicInfo, BasicInfoUpdate, MeasurementItemSnapshot,
} from "@entities/schedule";
import { toNumber, toNumberOrNull, trimValue } from "@shared/lib";

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
  records: AnalysisRecord[],
): AnalysisRowForm[] => {
  const recordByPollutantId = new Map(records.map((record) => [record.pollutantId, record]));

  return items.map((item) => {
    const empty = toEmptyRow(item);
    const record = recordByPollutantId.get(item.pollutantId);
    return record ? toSavedRow(empty, record) : empty;
  });
};

// 분석값은 필수, 나머지는 비우면 null(미입력)로 보낸다 — 빈 문자열을 저장하면 "입력했는데 공백"이 된다.
export const toAnalysisCreate = (row: AnalysisRowForm): AnalysisRecordCreate => ({
  pollutantId: row.pollutantId,
  analysisValue: toNumber(row.analysisValue),
  unit: emptyToNull(row.unit),
  analysisMethod: emptyToNull(row.analysisMethod),
  analysisEquipment: emptyToNull(row.analysisEquipment),
});

export const toAnalysisUpdate = (row: AnalysisRowForm): AnalysisRecordUpdate => ({
  analysisValue: toNumberOrNull(row.analysisValue),
  unit: emptyToNull(row.unit),
  analysisMethod: emptyToNull(row.analysisMethod),
  analysisEquipment: emptyToNull(row.analysisEquipment),
});

export const fromBasicInfo = (basicInfo: BasicInfo | null): AnalysisProgressForm => {
  if (!basicInfo) return getDefaultAnalysisProgressForm();
  return {
    receivedAt: basicInfo.receivedAt ?? "",
    analyzedAt: basicInfo.analyzedAt ?? "",
    issuedAt: basicInfo.issuedAt ?? "",
    analyst: basicInfo.analyst ?? "",
    technicalManager: basicInfo.technicalManager ?? "",
  };
};

/**
 * 분석 진행 정보 → 기본정보 수정 입력.
 * 이 화면이 다루지 않는 필드는 null로 둔다 — 서버가 "미전달 = 기존 값 유지"로 해석하므로
 * 측정 데이터 탭에서 입력한 채취 시각·채취자 표기를 덮어쓰지 않는다.
 */
export const toBasicInfoUpdate = (form: AnalysisProgressForm): BasicInfoUpdate => ({
  facilityManager: null,
  samplingWitness: null,
  analyst: emptyToNull(form.analyst),
  technicalManager: emptyToNull(form.technicalManager),
  receivedAt: emptyToNull(form.receivedAt),
  analyzedAt: emptyToNull(form.analyzedAt),
  issuedAt: emptyToNull(form.issuedAt),
  samplingStartedAt: null,
  samplingEndedAt: null,
  mentorName: null,
  menteeName: null,
});

const emptyToNull = (value: string): string | null => trimValue(value) || null;
