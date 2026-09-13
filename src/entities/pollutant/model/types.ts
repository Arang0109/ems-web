import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model"

/**
 * 이 고객사가 채택해 관리 중인 측정물질.
 *
 * 서버는 지원 물질 가이드에서 **채택한** 물질만 보유하므로 가이드에 없는 물질은 존재하지 않는다.
 * `method`·`nameKr`·`nameEn`·`equipment`·`testMethod` 만 고객사가 관리하고,
 * `code`·`field`·`phase` 는 가이드가 단일 진실 소스라 읽기 전용이다.
 */
export type Pollutant = {
  id: number,
  /** 채택한 가이드 항목 id. 항상 채워진다 */
  catalogId: number,
  /**
   * 모든 고객사에서 동일한 전역 키(예: `NOX`).
   * 측정분야 안에서만 유일하므로(대기 납·수질 납이 모두 `PB`) 물질을 지목할 때는 id 를 쓴다.
   */
  code: string,
  field: MeasurementField,
  nameKr: string,
  nameEn: string,
  /**
   * 고객사가 채택 시 정한 측정방법 — 같은 물질이라도 업체마다 다를 수 있다(이황화메틸: 테드라백·카트리지).
   * 신규 채택은 필수지만 이관 전 채택분은 비어 있을 수 있어 null 을 구분한다.
   */
  method: MeasurementMethod | null,
  /** 가이드가 비워 둘 수 있는 선택 항목이라 미지정을 null 로 구분한다 */
  phase: PollutantPhase | null,
  equipment: string,
  testMethod: string
}

/**
 * 아직 채택하지 않은 가이드 항목. 측정물질 등록 화면에서 고를 후보다.
 * 이미 채택한 항목과 폐지된 항목은 서버가 목록에서 제외한다.
 */
export type PollutantCandidate = {
  catalogId: number,
  code: string,
  field: MeasurementField,
  nameKr: string,
  phase: PollutantPhase | null,
  sortOrder: number | null
}

/**
 * 채택 입력. 가이드에 없는 물질은 만들 수 없으므로 `catalogId` 가 필수다.
 * `method` 도 필수다 — 가이드가 정하지 않고 고객사가 채택 시 정한다.
 * `nameKr` 을 비우면(null) 서버가 가이드의 표준 국문명을 복사한다.
 */
export type PollutantCreate = {
  catalogId: number,
  method: MeasurementMethod,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 수정 입력. 고객사 소유값만 담는다 — 다른 가이드 항목으로 바꾸려면 삭제 후 다시 채택한다.
 * 서버는 null·빈 문자열을 "기존 값 유지"로 읽는다(값을 비우는 방법은 없다). `method` 도 같다.
 */
export type PollutantUpdate = {
  method: MeasurementMethod | null,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}
