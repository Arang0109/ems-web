/**
 * 고객사가 성적서 템플릿에 쓰려고 정의한 커스텀 필드(이름).
 *
 * 값은 여기 없다 — 회차마다 측정계획 스냅샷(`snapshot.customFields[key]`)이 갖는다. 템플릿은
 * `${custom.<key>}` 로 읽으며, 정의되지 않았거나 채우지 않은 키는 빈칸이 된다.
 * `key` 는 등록 뒤 바뀌지 않는다 — 배포된 양식이 그 이름을 참조하기 때문이다.
 */
export type ScheduleCustomField = {
  id: number;
  key: string;
  label: string;
  sortOrder: number | null;
};

/** 등록 입력. `sortOrder` 는 비우면(null) 서버가 목록 맨 뒤를 준다. */
export type ScheduleCustomFieldCreate = {
  key: string;
  label: string;
  sortOrder: number | null;
};

/** 수정 입력. 라벨·표시 순서만이며 null 은 "기존 값 유지"다. 키는 바꾸지 않는다. */
export type ScheduleCustomFieldUpdate = {
  label: string | null;
  sortOrder: number | null;
};
