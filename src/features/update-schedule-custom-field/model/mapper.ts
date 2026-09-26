import type { ScheduleCustomFieldUpdate } from "@entities/schedule-custom-field";

import type { ScheduleCustomFieldUpdateForm } from "./types";

import { toNumberOrNull, trimValue } from "@shared/lib";

/** Form → Domain. 서버는 null 을 "기존 값 유지"로 읽지만 폼은 자기 필드 전부를 보내므로 라벨은 항상 채워진다. */
export const toScheduleCustomFieldUpdate = (form: ScheduleCustomFieldUpdateForm): ScheduleCustomFieldUpdate => ({
  label: trimValue(form.label),
  sortOrder: toNumberOrNull(form.sortOrder),
});
