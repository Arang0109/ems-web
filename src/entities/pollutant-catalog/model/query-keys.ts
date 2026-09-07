import type { MeasurementField } from "@shared/model";

export const pollutantCatalogKeys = {
  all: ["pollutant-catalog"] as const,
  lists: () => [...pollutantCatalogKeys.all, "list"] as const,
  list: (field?: MeasurementField, includeInactive?: boolean) =>
    [...pollutantCatalogKeys.lists(), field ?? null, includeInactive ?? false] as const,
};
