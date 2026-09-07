export const scheduleKeys = {
  all: ["schedule"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: () => [...scheduleKeys.lists()] as const,
  canceled: () => [...scheduleKeys.all, "canceled"] as const,
  details: () => [...scheduleKeys.all, "detail"] as const,
  detail: (id: number) => [...scheduleKeys.details(), id] as const,
  analysisLists: () => [...scheduleKeys.all, "analysis"] as const,
  analyses: (scheduleId: number) => [...scheduleKeys.analysisLists(), scheduleId] as const,
};
