import type { ScheduleCustomFieldsForm } from "./types";

/** 서버 `@Size(max = 500)` 과 같다. */
export const CUSTOM_FIELD_VALUE_MAX_LENGTH = 500;

export const validateScheduleCustomFieldsFields = (form: ScheduleCustomFieldsForm) => {
  const errors: Record<string, string> = {};

  for (const [key, value] of Object.entries(form)) {
    if (value.length > CUSTOM_FIELD_VALUE_MAX_LENGTH) {
      errors[key] = `${CUSTOM_FIELD_VALUE_MAX_LENGTH}자 이하로 입력해주세요.`;
    }
  }

  return errors;
};
