import type { MeasurementField, MeasurementMode, PollutantPhase, SampleGrouping } from "@shared/model"

/**
 * 이 고객사가 채택해 관리 중인 측정물질.
 *
 * 서버는 지원 물질 가이드에서 **채택한** 물질만 보유하므로 가이드에 없는 물질은 존재하지 않는다.
 * `methodId`·`samplingMinutes`·`nameKr`·`nameEn`·`equipment`·`testMethod` 만 고객사가 관리하고,
 * `code`·`field`·`phase` 는 가이드가, `methodName`·`sampleGrouping`·`mergedSampleName`·`methodSamplingMinutes` 는
 * 측정방법이 단일 진실 소스라 읽기 전용이다.
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
   * 신규 채택은 필수지만 측정방법이 정해지지 않은 레거시 행은 null 이다.
   */
  methodId: number | null,
  /**
   * 항목별 채취시간 오버라이드(분). 흡수액처럼 항목마다 따로 잡는 방법은 물질마다 시간이 다를 수 있어
   * 방법의 표준값을 덮어쓴다. 없으면 null. 통칭 채취(MERGED) 항목에는 둘 수 없다.
   */
  samplingMinutes: number | null,
  /** 측정방법 투영값. `methodId` 가 null 이면 전부 비어 있다 */
  methodName: string,
  sampleGrouping: SampleGrouping | null,
  mergedSampleName: string,
  /** 측정방법의 표준 채취시간(분). 미지정은 null */
  methodSamplingMinutes: number | null,
  /** 이 항목에 실제 적용되는 채취시간(분). 화면은 이것을 보여 준다 */
  effectiveSamplingMinutes: number | null,
  /** 가이드가 비워 둘 수 있는 선택 항목이라 미지정을 null 로 구분한다 */
  phase: PollutantPhase | null,
  /** 측정방식 분류(카탈로그 전역 사실). 회사 측정방법을 쪼개도 이 축으로 묶인다 */
  mode: MeasurementMode | null,
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
  mode: MeasurementMode | null,
  sortOrder: number | null
}

/**
 * 채택 입력. 가이드에 없는 물질은 만들 수 없으므로 `catalogId` 가 필수다.
 * `methodId` 도 필수다 — 가이드가 정하지 않고 고객사가 채택 시 정한다.
 * `samplingMinutes` 는 항목별 채취시간이며 비우면(null) 측정방법 표준값을 따른다.
 * `nameKr` 을 비우면(null) 서버가 가이드의 표준 국문명을 복사한다.
 */
export type PollutantCreate = {
  catalogId: number,
  methodId: number,
  samplingMinutes: number | null,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}

/**
 * 수정 입력. 고객사 소유값만 담는다 — 다른 가이드 항목으로 바꾸려면 삭제 후 다시 채택한다.
 * 서버는 null·빈 문자열을 "기존 값 유지"로 읽는다(값을 비우는 방법은 없다). `methodId` 도 같다.
 * **`samplingMinutes` 만 다르다** — 보낸 값이 그대로 저장되며 null 은 "측정방법 표준값으로 되돌림"이다.
 */
export type PollutantUpdate = {
  methodId: number | null,
  samplingMinutes: number | null,
  nameKr: string | null,
  nameEn: string | null,
  equipment: string | null,
  testMethod: string | null
}
