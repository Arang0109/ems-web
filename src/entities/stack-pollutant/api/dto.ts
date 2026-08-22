import type { MeasurementCycle } from "@shared/model";

/**
 * 등록 대상은 **이 고객사가 이미 채택한 측정물질**이다.
 * 아직 채택하지 않은 가이드 항목은 `POST /pollutants` 로 먼저 채택해야 한다 —
 * 서버는 등록 과정에서 측정물질을 대신 만들어 주지 않는다.
 */
export type StackPollutantRegisterRequest = {
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: number | null;
  /** 측정시설의 기준산소농도를 이 항목에 적용할지 여부 — 서버 계약이 primitive boolean(nullable 아님) */
  oxygenApplicable: boolean;
}

/**
 * 측정 조건만 바꾼다. `stackId`·`pollutantId` 는 받지 않는다 —
 * 어떤 시설의 어떤 물질인지가 바뀌면 다른 항목이므로 삭제 후 재등록이다.
 */
export type StackPollutantUpdateRequest = {
  cycle: MeasurementCycle;
  /** null 이면 "미지정"으로 비운다 */
  allowance: number | null;
  oxygenApplicable: boolean;
}

export type StackPollutantResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
}

export type StackPollutantTableResponse = {
  id: number;
  stackId: number;
  pollutantId: number;
  /** 모든 고객사에서 동일한 전역 측정물질 키(예: `NOX`). 가이드 투영값이라 항상 채워진다 */
  code: string;
  nameKr: string;
  nameEn: string;
  cycle: MeasurementCycle;
  allowance: string;
  oxygenApplicable: boolean;
}

export type StackPollutantBatchRegisterRequest = StackPollutantRegisterRequest[];
export type StackPollutantBatchResponse = StackPollutantResponse[];
