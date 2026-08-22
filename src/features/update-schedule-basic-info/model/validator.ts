import type { ScheduleBasicInfoUpdateForm } from "./types";

export const validateScheduleBasicInfoFields = (form: ScheduleBasicInfoUpdateForm) => {
  const errors: Partial<Record<keyof ScheduleBasicInfoUpdateForm, string>> = {};

  // 서버는 빈 값을 "기존 유지"로 읽으므로 비워도 사고는 나지 않지만,
  // 지운 채 저장하면 "지웠는데 그대로"로 보여 혼란스럽다. 입력을 강제해 그 상황을 없앤다.
  if (!form.measureDate) errors.measureDate = "측정일자를 선택해주세요.";

  return errors;
};
