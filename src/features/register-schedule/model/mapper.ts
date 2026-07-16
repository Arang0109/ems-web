import type { ScheduleCreate } from "@entities/schedule";
import type { MeasurementField } from "@shared/model";

import type { ScheduleRegisterForm } from "./types";

import { trimValue } from "@shared/lib";

// Form(string) → Domain(number) 변환. clientId·workplaceId는 UI 연쇄 선택용이므로 제외한다.
export const toScheduleCreate = (form: ScheduleRegisterForm): ScheduleCreate => ({
  stackId: Number(form.stackId),
  teamId: Number(form.teamId),
  measurementField: form.measurementField as MeasurementField,
  measureDate: form.measureDate ? `${form.measureDate}T00:00:00` : "",
  measurementType: form.measurementType || null,
  referenceNumber: trimValue(form.referenceNumber) || null,
  pollutantIds: form.pollutantIds.map(Number),
});
