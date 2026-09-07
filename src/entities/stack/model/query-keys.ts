export const stackKeys = {
  all: ["stack"] as const,
  lists: () => [...stackKeys.all, "list"] as const,
  /** `workplaceId: null` 은 필터 없는 전체 목록이다 — "아직 안 고름"과 다르다. */
  list: (workplaceId: number | null) => [...stackKeys.lists(), workplaceId] as const,
  details: () => [...stackKeys.all, "detail"] as const,
  detail: (stackId: number) => [...stackKeys.details(), stackId] as const,
};
