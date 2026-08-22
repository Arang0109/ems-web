import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

/** `GET /pollutants`·`GET /pollutants/candidates` 공통 쿼리. */
export type PollutantListQuery = {
  field?: MeasurementField;
}

/**
 * 이 고객사가 채택해 관리 중인 측정물질 한 건.
 *
 * `code`·`field`·`method`·`phase` 는 가이드(카탈로그)가 소유하는 값이라 수정 대상이 아니고,
 * 서버가 조인해 채워서 내려준다. `method`·`phase` 는 가이드가 비워 둘 수 있어 nullable 이다.
 */
export type PollutantResponse = {
  id: number,
  /** 채택한 가이드 항목 id. 가이드에 없는 물질은 만들 수 없으므로 항상 채워진다 */
  catalogId: number,
  /** 모든 고객사에서 동일한 전역 키(예: `NOX`) */
  code: string,
  field: MeasurementField,
  nameKr: string,
  nameEn: string | null,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 아직 채택하지 않은 가이드 항목 — 측정물질 등록 화면의 선택 후보다.
 * 영문명·시험장비·시험방법은 가이드가 보유하지 않는다(채택 후 고객사가 입력한다).
 */
export type PollutantCandidateResponse = {
  catalogId: number,
  code: string,
  field: MeasurementField,
  nameKr: string,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
  /** 법령 고시 순서. 서버가 이미 정렬해 내려주므로 표시용으로만 쓴다 */
  sortOrder: number | null
}

/**
 * 가이드 항목 채택. `catalogId` 는 필수이며 후보 목록의 값을 그대로 보낸다
 * (code 는 측정분야 안에서만 유일해 단독으로는 물질이 특정되지 않는다).
 * `nameKr` 을 비우면 가이드의 표준 국문명이 복사된다.
 */
export type PollutantRegisterRequest = {
  catalogId: number,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 고객사 소유값만 수정한다. 서버는 전달하지 않은(또는 빈 문자열인) 필드를 기존 값으로 유지한다.
 * 어떤 가이드 항목인지와 측정분야·측정방법·형태는 수정 대상이 아니다.
 */
export type PollutantUpdateRequest = {
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}
