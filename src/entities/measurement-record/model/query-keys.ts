export const measurementRecordKeys = {
  all: ["measurement-record"] as const,
  lists: () => [...measurementRecordKeys.all, "list"] as const,
  list: (stackId: number) => [...measurementRecordKeys.lists(), stackId] as const,
};
