import type { MeasurementField, MeasurementMode, PollutantPhase, SampleGrouping } from "@shared/model"

/** `GET /pollutants`·`GET /pollutants/candidates` 공통 쿼리. */
export type PollutantListQuery = {
  field?: MeasurementField;
}

/**
 * 이 고객사가 채택해 관리 중인 측정물질 한 건.
 *
 * `code`·`field`·`phase` 는 가이드(카탈로그)가 소유하는 값이라 수정 대상이 아니고,
 * 서버가 조인해 채워서 내려준다. `phase` 는 가이드가 비워 둘 수 있어 nullable 이다.
 * `methodId` 는 고객사가 채택 시 정한 측정방법이고, `methodName`·`sampleGrouping`·`mergedSampleName`·
 * `methodSamplingMinutes` 는 그 측정방법에서 조인해 채운 투영값이다 — 측정방법을 고치면 여기도 따라 바뀐다.
 * 측정방법이 정해지지 않은 레거시 행은 이 투영값이 전부 null 이다.
 * `samplingMinutes` 는 고객사가 이 항목에만 둔 채취시간 오버라이드이고, `effectiveSamplingMinutes` 가
 * 실제 적용값(서버가 계산)이다 — 화면은 이것을 보여 준다.
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
  methodId: number | null,
  methodName: string | null,
  sampleGrouping: SampleGrouping | null,
  mergedSampleName: string | null,
  /** 항목별 채취시간 오버라이드(분). 없으면 null */
  samplingMinutes: number | null,
  /** 측정방법의 표준 채취시간(분). 측정방법이 비어 있거나 미지정이면 null */
  methodSamplingMinutes: number | null,
  /** 이 항목에 실제 적용되는 채취시간(분). 통칭 채취면 방법 값, 아니면 `samplingMinutes ?? methodSamplingMinutes` */
  effectiveSamplingMinutes: number | null,
  phase: PollutantPhase | null,
  /** 측정방식 분류 — 카탈로그 투영값. 회사 측정방법과 무관하게 항목을 묶는 축 */
  mode: MeasurementMode | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 아직 채택하지 않은 가이드 항목 — 측정물질 등록 화면의 선택 후보다.
 * 영문명·시험장비·시험방법·측정방법은 가이드가 보유하지 않는다(채택 시 고객사가 정한다).
 */
export type PollutantCandidateResponse = {
  catalogId: number,
  code: string,
  field: MeasurementField,
  nameKr: string,
  phase: PollutantPhase | null,
  mode: MeasurementMode | null,
  /** 법령 고시 순서. 서버가 이미 정렬해 내려주므로 표시용으로만 쓴다 */
  sortOrder: number | null
}

/**
 * 가이드 항목 채택. `catalogId` 는 필수이며 후보 목록의 값을 그대로 보낸다
 * (code 는 측정분야 안에서만 유일해 단독으로는 물질이 특정되지 않는다).
 * `methodId` 도 필수다(서버 `@NotNull`) — 같은 물질이라도 업체마다 다를 수 있어 고객사가 정한다.
 * `GET /measurement-methods` 의 id 를 보낸다. `nameKr` 을 비우면 가이드의 표준 국문명이 복사된다.
 * `samplingMinutes` 는 항목별 채취시간(분)이다 — 비우면(null) 측정방법의 표준값을 따르고,
 * 한 병으로 함께 채취하는(MERGED) 방법의 항목에 지정하면 서버가 400 으로 거부한다.
 */
export type PollutantRegisterRequest = {
  catalogId: number,
  methodId: number,
  samplingMinutes: number | null,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 고객사 소유값만 수정한다. 서버는 전달하지 않은(또는 빈 문자열인) 필드를 기존 값으로 유지한다.
 * 어떤 가이드 항목인지와 측정분야·형태는 수정 대상이 아니다. `methodId` 는 null 이면 유지된다.
 * **`samplingMinutes` 만 예외로 보낸 값이 그대로 저장된다** — null 은 "측정방법 표준값으로 되돌림"이다.
 */
export type PollutantUpdateRequest = {
  methodId: number | null,
  samplingMinutes: number | null,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}
