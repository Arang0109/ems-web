import type { MeasurementField, Grade, Shape, Orientation } from "@shared/model";

// 측정계획 문서의 측정시설(굴뚝) 스냅샷만 다루는 폼.
// 숫자 필드는 텍스트 입력의 동작과 맞추기 위해 전부 string으로 둔다.
// number 변환은 mapper(Form→Domain 경계)에서 한 번만 일어난다.
export type ScheduleStackUpdateForm = {
  field: MeasurementField;
  name: string;
  semsNumber: string;
  grade: Grade;
  mainProduct: string;
  standardOxygen: string;
  height: string;
  horizontalLength: string;
  verticalLength: string;
  shape: Shape;
  orientation: Orientation;
};

export const getDefaultForm = (): ScheduleStackUpdateForm => ({
  field: "AIR",
  name: "",
  semsNumber: "",
  grade: "TYPE_1",
  mainProduct: "",
  standardOxygen: "",
  height: "",
  horizontalLength: "",
  verticalLength: "",
  shape: "CIRCULAR",
  orientation: "VERTICAL",
});
