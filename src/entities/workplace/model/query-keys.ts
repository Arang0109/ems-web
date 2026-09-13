export const workplaceKeys = {
  all: ["workplace"] as const,
  lists: () => [...workplaceKeys.all, "list"] as const,
  /** `clientId: null` 은 필터 없는 전체 목록이다 — "아직 안 고름"과 다르다. */
  list: (clientId: number | null) => [...workplaceKeys.lists(), clientId] as const,
  details: () => [...workplaceKeys.all, "detail"] as const,
  detail: (workplaceId: number) => [...workplaceKeys.details(), workplaceId] as const,
};
