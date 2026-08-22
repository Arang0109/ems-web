import type { ScheduleItemsForm } from "./types";

// 측정할 항목이 하나도 없는 측정계획은 성립하지 않는다(서버도 @NotEmpty로 거부한다).
export const validateScheduleItemsFields = (form: ScheduleItemsForm) => {
  const errors: Partial<Record<keyof ScheduleItemsForm, string>> = {};

  if (form.pollutantIds.length === 0) {
    errors.pollutantIds = "측정항목을 하나 이상 선택해주세요.";
  }

  return errors;
};
