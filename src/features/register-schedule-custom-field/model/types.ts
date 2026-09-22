/**
 * 커스텀 필드 등록 폼.
 *
 * `key` 가 핵심 입력이다 — 성적서 템플릿이 `${custom.<key>}` 로 읽는 이름이라 영문 식별자여야 하고,
 * 등록 뒤에는 바꿀 수 없다. `label` 은 회차 값 입력 폼에 보이는 이름이다.
 * 표시 순서는 숫자 입력이라 Form 레이어에서는 문자열이다(빈 값 `""` = 맨 뒤).
 */
export type ScheduleCustomFieldRegisterForm = {
  key: string;
  label: string;
  sortOrder: string;
};

export const getDefaultForm = (): ScheduleCustomFieldRegisterForm => ({
  key: "",
  label: "",
  sortOrder: "",
});
