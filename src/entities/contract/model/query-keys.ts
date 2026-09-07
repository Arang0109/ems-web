export const contractKeys = {
  all: ["contract"] as const,
  lists: () => [...contractKeys.all, "list"] as const,
  list: () => [...contractKeys.lists()] as const,
  details: () => [...contractKeys.all, "detail"] as const,
  detail: (contractId: number) => [...contractKeys.details(), contractId] as const,
};
