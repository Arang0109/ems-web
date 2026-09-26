import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import type { ScheduleCustomFieldTableRow } from "./types";

/** 비어 있을 수 있는 칸의 표시 자리. 빈 칸으로 두면 열이 무너져 보인다. */
const EMPTY = "—";

export const toScheduleCustomFieldRow = (field: ScheduleCustomField): ScheduleCustomFieldTableRow => ({
  id: field.id,
  key: `\${custom.${field.key}}`,
  label: field.label,
  sortOrder: field.sortOrder != null ? String(field.sortOrder) : EMPTY,
});
