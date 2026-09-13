export const stackPollutantKeys = {
  all: ["stack-pollutant"] as const,
  lists: () => [...stackPollutantKeys.all, "list"] as const,
  /** `stackId: null` 은 필터 없는 전체 목록이다 — "아직 안 고름"과 다르다. */
  list: (stackId: number | null) => [...stackPollutantKeys.lists(), stackId] as const,
};
