/** 쿼리 키 팩토리 — 슬라이스가 자기 키를 소유한다. */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  measurementStats: () => [...dashboardKeys.all, "measurement-stats"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};
