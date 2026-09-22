import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import { toFormValue } from "@shared/lib";

/**
 * 커스텀 필드 수정 폼. 라벨·표시 순서만이다 — 키는 배포된 양식과 저장된 값의 계약이라 바꾸지 않는다.
 * 표시 순서는 숫자 입력이라 Form 레이어에서는 문자열이다.
 */
export type ScheduleCustomFieldUpdateForm = {
  label: string;
  sortOrder: string;
};

/** prop 은 useState 초기값으로만 쓴다 — 다시 열 때의 초기화는 부모의 key 리마운트가 담당한다. */
export const getDefaultForm = (field: ScheduleCustomField | null): ScheduleCustomFieldUpdateForm => ({
  label: field?.label ?? "",
  sortOrder: toFormValue(field?.sortOrder),
});
