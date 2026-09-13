/**
 * 쿼리 키 팩토리 — 슬라이스가 자기 키를 소유한다.
 *
 * 계층(`all` → `lists`/`details` → 개별)으로 쌓아 상위 키 하나로 하위를 통째로 무효화할 수 있다.
 * `invalidateQueries({ queryKey: userKeys.all })` 이면 목록·상세가 함께 갱신된다.
 */
export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};
