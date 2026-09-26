import type { MeasurementField, MeasurementMode, PollutantPhase } from "@shared/model"

/**
 * 법령에 근거한 측정물질 마스터. 모든 고객사가 공통으로 참조하는 전역 데이터라
 * 여기서 바꾼 값은 따로 덮어쓰지 않은 모든 고객사에 반영된다.
 *
 * 측정방법은 갖지 않는다 — 같은 물질이라도 업체마다 다를 수 있어(이황화메틸: 테드라백·카트리지)
 * 고객사가 채택할 때 `Pollutant` 에 정한다.
 */
export type PollutantCatalog = {
  id: number,
  /**
   * 물질을 가리키는 불변 키(예: `NOX`). 한번 부여하면 바꿀 수 없다 —
   * 측정계획 스냅샷에 영구 보관되고 클라이언트 분기 로직이 이 값에 의존한다.
   * 유일 범위는 **측정분야 안**이라 대기 납과 수질 납이 모두 `PB` 로 존재한다.
   */
  code: string,
  field: MeasurementField,
  nameKr: string,
  phase: PollutantPhase | null,
  /** 측정방식 분류(현장측정·먼지·중금속·수은·가스상 채취). 전역 사실이라 가이드가 갖는다. 분류 도입 이전 항목은 null */
  mode: MeasurementMode | null,
  /** 선택 목록에서의 노출 순서. 미지정이면 null */
  sortOrder: number | null,
  /** 폐지되지 않았는지. false 면 고객사 선택 목록에서 감춰진다 */
  active: boolean
}

export type PollutantCatalogCreate = {
  code: string,
  field: MeasurementField,
  nameKr: string,
  phase: PollutantPhase | null,
  /** 측정방식 분류(현장측정·먼지·중금속·수은·가스상 채취). 전역 사실이라 가이드가 갖는다. 분류 도입 이전 항목은 null */
  mode: MeasurementMode | null,
  sortOrder: number | null
}

/** `code` 는 변경할 수 없으므로 수정 입력에 포함하지 않는다. */
export type PollutantCatalogUpdate = {
  field: MeasurementField,
  nameKr: string,
  phase: PollutantPhase | null,
  /** 측정방식 분류(현장측정·먼지·중금속·수은·가스상 채취). 전역 사실이라 가이드가 갖는다. 분류 도입 이전 항목은 null */
  mode: MeasurementMode | null,
  sortOrder: number | null
}
