export const scheduleCustomFieldKeys = {
  all: ["schedule-custom-field"] as const,
  lists: () => [...scheduleCustomFieldKeys.all, "list"] as const,
  list: () => [...scheduleCustomFieldKeys.lists()] as const,
};
