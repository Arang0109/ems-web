import type { ScheduleCustomField } from "@entities/schedule-custom-field";

/**
 * 회차 커스텀 필드 값 폼 — 정의된 키 → 입력값. 칸의 집합은 고객사의 커스텀 필드 정의가 정하고,
 * 초기값은 이 회차 스냅샷의 값이다. 정의에서 사라진 키의 옛 값은 폼에 올리지 않는다(저장 시 정리된다).
 */
export type ScheduleCustomFieldsForm = Record<string, string>;

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (
  definitions: ScheduleCustomField[],
  values: Record<string, string> | null,
): ScheduleCustomFieldsForm =>
  Object.fromEntries(definitions.map((definition) => [definition.key, values?.[definition.key] ?? ""]));
