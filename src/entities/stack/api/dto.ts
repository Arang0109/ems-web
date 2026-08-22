import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model"

export type StackRegisterRequest = {
  workplaceId: number;
  field: MeasurementField,
  name: string,
  semsNumber: string,
  grade: Grade,
  mainProduct: string,
  /** 기준산소농도(%) — 서버 계약이 Integer(nullable). 치수와 달리 응답도 number 다. */
  standardOxygen: number | null,
}

export type StackUpdateRequest = {
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: number | null;
  /** 서버 `UpdateStackRequest` 는 Double(nullable). 응답(`StackResponse`)은 String 이라 읽기/쓰기가 비대칭이다. */
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
}

export type StackResponse = {
  id: number;
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  standardOxygen: number | null;
  createdAt: Date;
  modifiedAt: Date;
}

export type StackListResponse = {
  id: number,
  clientName: string,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  createdAt: string,
  modifiedAt: string,
}

export type StackDetailResponse = {
  id: number;
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  standardOxygen: number | null;
  createdAt: Date;
  modifiedAt: Date;

  preventions: PreventionResponse[];
  facilities: FacilityResponse[];
}

export type PreventionResponse = {
  id: number;
  stackId: number;
  name: string;
  capacity: number | null;
  /** 용량의 단위(유량 단위). 숫자 값이 아니라 표기이므로 전 레이어 string 이다. */
  unit: string | null;
  targetName: string | null;
  removalEfficiency: string | null;
}

export type FacilityResponse = {
  id: number;
  stackId: number;
  name: string;
  fuelUsage: string | null;
  productOutput: string | null;
  incinerationAmount: string | null;
  fuelInput: string | null;
  fuelType: string | null;
  unit: string | null;
}

export type FacilityRegisterRequest = {
  stackId: number;
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type FacilityUpdateRequest = {
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

/**
 * 배출시설 순서 변경 요청.
 * `orderedIds` 는 이 측정지점의 배출시설 **전체**여야 하며, 배열 순서가 곧 표시 순위다.
 * 집합이 서버와 다르면 서버가 아무것도 저장하지 않고 거절한다.
 */
export type FacilityReorderRequest = {
  stackId: number;
  orderedIds: number[];
}

export type PreventionRegisterRequest = {
  stackId: number;
  name: string;
  capacity: number | null;
  unit: string;
  targetName: string;
  removalEfficiency: string;
}

export type PreventionUpdateRequest = {
  name: string;
  capacity: number | null;
  unit: string;
  targetName: string;
  removalEfficiency: string;
}

/**
 * 방지시설 순서 변경 요청.
 * `orderedIds` 는 이 측정지점의 방지시설 **전체**여야 하며, 배열 순서가 곧 표시 순위다.
 * 집합이 서버와 다르면 서버가 아무것도 저장하지 않고 거절한다.
 */
export type PreventionReorderRequest = {
  stackId: number;
  orderedIds: number[];
}
