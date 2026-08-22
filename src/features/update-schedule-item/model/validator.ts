import type { ScheduleItemUpdateForm } from "./types";

// 허용기준은 "미지정"이 유효한 값이라 비워 두는 것을 막지 않는다.
// 다만 숫자로 읽히지 않는 입력은 서버에서 400이 되므로 여기서 걸러 낸다.
export const validateScheduleItemFields = (form: ScheduleItemUpdateForm) => {
  const errors: Partial<Record<keyof ScheduleItemUpdateForm, string>> = {};

  const allowance = form.allowance.trim();
  if (allowance && Number.isNaN(Number(allowance.replace(/,/g, "")))) {
    errors.allowance = "허용기준은 숫자로 입력해주세요.";
  }
  if (allowance && Number(allowance.replace(/,/g, "")) < 0) {
    errors.allowance = "허용기준은 0 이상이어야 합니다.";
  }

  return errors;
};
