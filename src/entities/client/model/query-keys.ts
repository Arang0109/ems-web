/**
 * 쿼리 키 팩토리 — 슬라이스가 자기 키를 소유한다.
 *
 * 계층(`all` → `lists`/`details` → 개별)으로 쌓아 상위 키 하나로 하위를 통째로 무효화할 수 있다.
 * `invalidateQueries({ queryKey: clientKeys.all })` 이면 목록·상세가 함께 갱신된다.
 */
export const clientKeys = {
  all: ["client"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: () => [...clientKeys.lists()] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: number) => [...clientKeys.details(), id] as const,
};
