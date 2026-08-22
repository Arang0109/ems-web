import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

/** `GET /platform/pollutant-catalog` 쿼리. 서버 기본값은 `includeInactive=false` 다. */
export type PollutantCatalogListQuery = {
  field?: MeasurementField;
  /** true 면 폐지된 항목도 함께 받는다 */
  includeInactive?: boolean;
}

export type PollutantCatalogResponse = {
  id: number,
  code: string,
  field: MeasurementField,
  nameKr: string,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
  sortOrder: number | null,
  active: boolean
}

/**
 * 영문명·시험장비·시험방법은 가이드가 보유하지 않는다 — 고객사가 채택한 뒤 직접 입력하는 값이다.
 *
 * `code` 는 등록할 때만 정한다 — 측정계획 스냅샷과 프론트 분기 로직이 이 값에 의존해
 * 서버가 수정을 허용하지 않는다.
 */
export type PollutantCatalogRegisterRequest = {
  code: string,
  field: MeasurementField,
  nameKr: string,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
  sortOrder: number | null
}

/** 서버는 전달하지 않은(또는 빈 문자열인) 필드를 기존 값으로 유지한다. `code` 는 대상이 아니다. */
export type PollutantCatalogUpdateRequest = {
  field: MeasurementField,
  nameKr: string,
  method: MeasurementMethod | null,
  phase: PollutantPhase | null,
  sortOrder: number | null
}
