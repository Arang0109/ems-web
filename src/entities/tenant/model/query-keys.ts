export const tenantKeys = {
  all: ["tenant"] as const,
  lists: () => [...tenantKeys.all, "list"] as const,
  list: () => [...tenantKeys.lists()] as const,
};
