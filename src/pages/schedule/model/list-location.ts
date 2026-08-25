/**
 * 목록 → 상세 이동에 실어 보내는 라우팅 상태.
 *
 * 목록의 조회 조건은 URL 쿼리에 있으므로, 상세의 뒤로가기가 그 쿼리를 되돌려야 보던 목록으로
 * 돌아온다. 목록에서 들어온 경우에만 값이 있고, 대시보드·직접 진입은 비어 있다.
 */
export interface ScheduleListLocationState {
  /** 떠나올 때의 목록 쿼리스트링 (`?from=…&to=…`) */
  listSearch?: string;
}

export const toScheduleListState = (search: string): ScheduleListLocationState => ({
  listSearch: search,
});

/**
 * 라우팅 상태에서 목록 쿼리를 읽는다.
 *
 * `useLocation().state` 는 무엇이든 들어올 수 있는 `any` 라, 단언을 이 함수 하나에 가둔다.
 */
export const readScheduleListSearch = (state: unknown): string => {
  const listSearch = (state as ScheduleListLocationState | null)?.listSearch;
  return typeof listSearch === "string" ? listSearch : "";
};
