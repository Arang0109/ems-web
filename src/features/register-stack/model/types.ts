import type { Workplace } from "@entities/workplace";
import type { MeasurementField, Grade } from "@shared/model";

export type StackRegisterForm = {
  workplaceId: number,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  /** 기준산소농도(%) — 텍스트 입력이라 string. number 변환은 mapper에서 한 번만 한다 */
  standardOxygen: string;
}

export const getDefaultStackRegisterForm = (workplace?: Workplace | null): StackRegisterForm => ({
  workplaceId: workplace?.id ?? 0,
  workplaceName: workplace?.name ?? "",
  field: "AIR",
  stackName: "",
  semsNumber: "",
  grade: "TYPE_1",
  mainProduct: "",
  standardOxygen: "",
});