import type { MeasurementCycle } from "@shared/model";

export type StackProfile = {
  field: string;
  name: string;
  semsNumber: string;
  grade: string;
  mainProduct: string;
  standardOxygen: string;
  height: string;
  diameter: string; // v + h (shape 에 따라 바뀜)
  shape: string;
  orientation: string;
}

export type MeasurementProfile = {
  /** stack_pollutant id — 수정·삭제 대상을 지목한다 */
  id: number;
  nameKr: string;
  nameEn: string;
  /** 주기별 묶음의 축 — 표시 문자열이 아니라 원본 enum 이어야 정렬·그룹이 가능하다 */
  cycle: MeasurementCycle;
  allowance: string;
  /** 기준산소농도 보정을 적용하는 항목인지. 적용하는 항목만 화면에 표시한다 */
  oxygenApplicable: boolean;
}

/**
 * 측정주기별 측정항목 묶음.
 *
 * 측정계획 상세(`schedule-profile`)의 측정항목 카드와 같은 형태로 보여주기 위해
 * 평평한 목록 대신 주기 단위로 나눠 담는다.
 */
export type MeasurementCycleGroup = {
  cycle: MeasurementCycle;
  label: string;
  items: MeasurementProfile[];
}
