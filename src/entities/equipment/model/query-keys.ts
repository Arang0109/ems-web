import type { EquipType } from "@shared/model";

export const equipmentKeys = {
  all: ["equipment"] as const,
  lists: () => [...equipmentKeys.all, "list"] as const,
  list: (type?: EquipType) => [...equipmentKeys.lists(), type ?? null] as const,
  details: () => [...equipmentKeys.all, "detail"] as const,
  detail: (id: string) => [...equipmentKeys.details(), id] as const,
  inspectionList: () => [...equipmentKeys.all, "inspection-record"] as const,
  inspectionRecords: (equipmentId: string) => [...equipmentKeys.inspectionList(), equipmentId] as const,
};
