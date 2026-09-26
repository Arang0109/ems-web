import type { ScheduleCustomFieldCreate } from "@entities/schedule-custom-field";

import type { ScheduleCustomFieldRegisterForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

/**
 * Form → Domain. 표시 순서를 비우면 null 로 보내 서버가 목록 맨 뒤(`max+10`)를 주게 한다.
 * 키 형식은 호출부가 validator 로 이미 막았으므로 여기서는 공백만 정리한다.
 */
export const toScheduleCustomFieldCreate = (form: ScheduleCustomFieldRegisterForm): ScheduleCustomFieldCreate => ({
  key: trimValue(form.key),
  label: trimValue(form.label),
  sortOrder: toNumberOrNull(form.sortOrder),
});
