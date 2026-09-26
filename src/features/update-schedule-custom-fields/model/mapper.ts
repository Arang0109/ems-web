import type { ScheduleCustomFieldsSave } from "@entities/schedule";
import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import type { ScheduleCustomFieldsForm } from "./types";

import { trimValue } from "@shared/lib";

/**
 * Form → Domain. **전체 채택** 페이로드다 — 정의된 키 전부를 싣고, 빈 값은 빈 문자열 그대로 보내
 * 서버가 "지웠다"로 읽게 한다. 정의에 없는 키는 싣지 않는다(서버가 400 으로 거부한다).
 */
export const toScheduleCustomFieldsSave = (
  form: ScheduleCustomFieldsForm,
  definitions: ScheduleCustomField[],
): ScheduleCustomFieldsSave => ({
  values: Object.fromEntries(definitions.map((definition) => [definition.key, trimValue(form[definition.key] ?? "")])),
});
