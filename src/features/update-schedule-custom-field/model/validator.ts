import type { ScheduleCustomFieldUpdateForm } from "./types";

const LABEL_MAX_LENGTH = 100;

/** 서버 규칙과 같다 — 이름은 필수·100자 이하, 표시 순서는 비우거나 0 이상의 정수. */
export const validateScheduleCustomFieldUpdateFields = (form: ScheduleCustomFieldUpdateForm) => {
  const errors: Partial<Record<keyof ScheduleCustomFieldUpdateForm, string>> = {};

  const label = form.label.trim();
  if (!label) errors.label = "화면에 보일 이름을 입력해주세요.";
  else if (label.length > LABEL_MAX_LENGTH) errors.label = `이름은 ${LABEL_MAX_LENGTH}자 이하여야 합니다.`;

  const sortOrder = form.sortOrder.trim();
  if (sortOrder && !/^\d+$/.test(sortOrder)) errors.sortOrder = "표시 순서는 0 이상의 정수로 입력해주세요.";

  return errors;
};
