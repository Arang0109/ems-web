export const measurementMethodKeys = {
  all: ["measurement-method"] as const,
  lists: () => [...measurementMethodKeys.all, "list"] as const,
  list: () => [...measurementMethodKeys.lists()] as const,
};
