import type { Workplace } from "@entities/workplace";
import type { MeasurementField, Grade } from "@shared/model";

export type StackRegisterForm = {
  workplaceId: number,
  workplaceName: string,
  field: MeasurementField,
  stackName: string,
  semsNumber: string;
  grade: Grade;
  businessCategory: string;
  mainProduct: string;
}

export const getDefaultStackRegisterForm = (workplace?: Workplace | null): StackRegisterForm => ({
  workplaceId: workplace?.id ?? 0,
  workplaceName: workplace?.name ?? "",
  field: "AIR",
  stackName: "",
  semsNumber: "",
  grade: "TYPE_1",
  businessCategory: "",
  mainProduct: "",
});