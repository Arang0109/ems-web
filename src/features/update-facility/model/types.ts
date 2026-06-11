export type FacilityUpdateForm = {
  name: string;
  fuelType: string;
  fuelUsage: string;
  fuelInput: string;
}

export const getDefaultFacilityUpdateForm = (facility?: { name: string; fuelType: string; fuelUsage: string; fuelInput: string }): FacilityUpdateForm => ({
  name: facility?.name ?? '',
  fuelType: facility?.fuelType ?? '',
  fuelUsage: facility?.fuelUsage ?? '',
  fuelInput: facility?.fuelInput ?? '',
});
