import type { ScheduleRegisterForm } from "./types";

export const validateScheduleFields = (form: ScheduleRegisterForm) => {
  const errors: Partial<Record<keyof ScheduleRegisterForm, string>> = {};

  if (!form.clientId) errors.clientId = "거래처를 선택해주세요.";
  if (!form.workplaceId) errors.workplaceId = "사업장을 선택해주세요.";
  if (!form.stackId) errors.stackId = "측정시설을 선택해주세요.";
  if (!form.teamId) errors.teamId = "측정 팀을 선택해주세요.";
  if (!form.measurementField) errors.measurementField = "측정 분야를 선택해주세요.";
  if (!form.measureDate) errors.measureDate = "측정 일자를 선택해주세요.";
  if (form.pollutantIds.length === 0) errors.pollutantIds = "측정항목을 1개 이상 선택해주세요.";

  return errors;
};
