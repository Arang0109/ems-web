import type { Facility } from '@entities/stack';

export type FacilityUpdateForm = {
  name: string;
  fuelType: string;
  fuelUsage: string;
  fuelInput: string;
  productOutput: string;
  incinerationAmount: string;
  unit: string;
}

export const getDefaultFacilityUpdateForm = (facility?: Facility): FacilityUpdateForm => ({
  name: facility?.name ?? '',
  fuelType: facility?.fuelType ?? '',
  fuelUsage: facility?.fuelUsage ?? '',
  fuelInput: facility?.fuelInput ?? '',
  productOutput: facility?.productOutput ?? '',
  incinerationAmount: facility?.incinerationAmount ?? '',
  unit: facility?.unit ?? '',
});
