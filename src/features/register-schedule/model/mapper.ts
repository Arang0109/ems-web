import type { ScheduleCreate } from "@entities/schedule";

import type { ScheduleRegisterForm } from "./types";

import { trimValue } from "@shared/lib";

// Form(string) → Domain(number) 변환. clientId·workplaceId는 UI 연쇄 선택용이므로 제외한다.
export const toScheduleCreate = (form: ScheduleRegisterForm): ScheduleCreate => ({
  stackId: Number(form.stackId),
  teamId: Number(form.teamId),
  mentorId: Number(form.mentorId) || null,
  menteeId: Number(form.menteeId) || null,
  measurementField: form.measurementField,
  sampledAt: form.measureDate,                    // 서버 LocalDate ("yyyy-MM-dd")
  schedulePurpose: form.measurementType || null,
  referenceNumber: trimValue(form.referenceNumber) || null,
  pollutantIds: form.pollutantIds.map(Number),
});
