import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";

// 의뢰기관→사업장→측정시설 트리를 한 폼에서 다루므로, 필드명이 겹치는 하위 계층에는
// 접두어를 붙여 평탄하게 둔다. fieldErrors(keyof 기반)를 그대로 쓰기 위한 구조다.
// 숫자 필드는 텍스트 입력의 동작과 맞추기 위해 전부 string으로 둔다.
// number 변환은 mapper(Form→Domain 경계)에서 한 번만 일어난다.
export type ScheduleClientUpdateForm = {
  // 의뢰기관
  name: string;
  // 사업장
  workplaceName: string;
  workplaceGrade: Grade;
  workplaceZipcode: string;
  workplaceRoadAddress: string;
  workplaceDetailAddress: string;
  // 측정시설
  stackField: MeasurementField;
  stackName: string;
  stackSemsNumber: string;
  stackGrade: Grade;
  businessCategory: string;
  mainProduct: string;
  standardOxygen: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
};

export const getDefaultForm = (): ScheduleClientUpdateForm => ({
  name: "",
  workplaceName: "",
  workplaceGrade: "TYPE_1",
  workplaceZipcode: "",
  workplaceRoadAddress: "",
  workplaceDetailAddress: "",
  stackField: "AIR",
  stackName: "",
  stackSemsNumber: "",
  stackGrade: "TYPE_1",
  businessCategory: "",
  mainProduct: "",
  standardOxygen: "",
  height: "",
  horizontalLength: "",
  verticalLength: "",
  shape: "CIRCULAR",
  orientation: "VERTICAL",
});
