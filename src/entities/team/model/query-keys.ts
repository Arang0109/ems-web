export const teamKeys = {
  all: ["team"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: () => [...teamKeys.lists()] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: number) => [...teamKeys.details(), id] as const,
};
