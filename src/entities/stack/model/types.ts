import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";

export type Stack = {
  id: number,
  workplaceId: number;
  field: MeasurementField,
  name: string,
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
  /** 기준산소농도(%) — 서버가 nullable 이라 "미지정"과 0을 구분한다 */
  standardOxygen: number | null;
  createdAt: Date;
  modifiedAt: Date;
}

export const getStackDefault = (): Stack => ({
  id: 0,
  workplaceId: 0,
  field: 'AIR' as MeasurementField,
  name: '',
  semsNumber: '',
  grade: 'TYPE_1' as Grade,
  mainProduct: '',
  height: '',
  horizontalLength: '',
  verticalLength: '',
  shape: 'CIRCULAR' as Shape,
  orientation: 'VERTICAL' as Orientation,
  standardOxygen: null,
  createdAt: new Date(),
  modifiedAt: new Date(),
});

export type StackCreate = {
  workplaceId: number;
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: number | null;
}

export type StackUpdate = {
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: number | null;
  /** 서버 계약이 nullable Double — 미입력은 0 이 아니라 null 로 보낸다 */
  height: number | null;
  horizontalLength: number | null;
  verticalLength: number | null;
  shape: Shape;
  orientation: Orientation;
}

export type StackListItem = {
  id: number,
  clientName: string,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  createdAt: string,
  modifiedAt: string,
}

export type StackDetail = {
  stack: Stack,
  preventions: Prevention[];
  facilities: Facility[];
}

export const getStackDetailDefault = (): StackDetail => ({
  stack: getStackDefault(),
  preventions: [],
  facilities: [],
});

export type Prevention = {
  id: number;
  name: string;
  capacity: number | null;
  /** 용량의 단위(유량 단위) — 숫자 값이 아니라 표기이므로 string */
  unit: string;
  targetName: string;
  removalEfficiency: string;
}

export type Facility = {
  id: number;
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type FacilityCreate = {
  stackId: number;
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type FacilityUpdate = {
  name: string;
  fuelUsage: string;
  productOutput: string;
  incinerationAmount: string;
  fuelInput: string;
  fuelType: string;
  unit: string;
}

export type PreventionCreate = {
  stackId: number;
  name: string;
  capacity: number | null;
  unit: string;
  targetName: string;
  removalEfficiency: string;
}

export type PreventionUpdate = {
  name: string;
  capacity: number | null;
  unit: string;
  targetName: string;
  removalEfficiency: string;
}