import type { ScheduleBasicInfoUpdateForm } from "./types";

export const validateScheduleBasicInfoFields = (form: ScheduleBasicInfoUpdateForm) => {
  const errors: Partial<Record<keyof ScheduleBasicInfoUpdateForm, string>> = {};

  // 채취일자는 측정 건수 집계의 기준일이라 서버가 필수로 받는다 — 비운 채 보내면 400 이다.
  if (!form.measureDate) errors.measureDate = "측정일자를 선택해주세요.";

  return errors;
};
