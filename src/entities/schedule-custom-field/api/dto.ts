/**
 * 측정계획 커스텀 필드 정의 한 건 — 서버 `CustomFieldDefinitionResponse`.
 *
 * 고객사가 성적서(채취기록부) 템플릿에 쓰려고 스스로 정의한 **이름**이다. 서버 코드에 고정된 필드 밖의
 * 칸(현장 코드·결재선 등)을 템플릿이 `${custom.<key>}` 로 읽을 수 있게 한다. 이 데이터는 이름만 갖고,
 * 회차별 **값**은 측정계획 스냅샷(`snapshot.customFields`)이 갖는다.
 */
export type CustomFieldDefinitionResponse = {
  id: number;
  /** 템플릿이 참조하는 키. 등록 후 바뀌지 않는다 */
  key: string;
  /** 화면 라벨 */
  label: string;
  sortOrder: number | null;
};

/**
 * 등록 — POST /schedules/custom-fields (ADMIN).
 * `key` 는 영문자·숫자·밑줄만, 영문자 또는 밑줄로 시작, 50자 이하(서버 `^[A-Za-z_][A-Za-z0-9_]*$`).
 * JEXL 예약어(`class`·`empty`·`size`·`eq`·`null` …)는 400. `sortOrder` 를 비우면 목록 맨 뒤에 붙는다.
 */
export type CustomFieldDefinitionRegisterRequest = {
  key: string;
  label: string;
  sortOrder: number | null;
};

/**
 * 수정 — PUT /schedules/custom-fields/{fieldId} (ADMIN).
 * 라벨·표시 순서만 고친다. **키는 바꿀 수 없다** — 배포된 템플릿과 저장된 값의 계약이기 때문이다.
 * null(blank 포함)은 "기존 값 유지"다.
 */
export type CustomFieldDefinitionUpdateRequest = {
  label: string | null;
  sortOrder: number | null;
};
