export type ScheduleCustomFieldTableRow = {
  /** 커스텀 필드 id. 상세 모달 대상 지목에 쓴다 */
  id: number;
  /** 템플릿 이름 — `${custom.<key>}` 표기로 보여 준다 */
  key: string;
  label: string;
  /** 표시 순서. 미지정은 EMPTY */
  sortOrder: string;
};
