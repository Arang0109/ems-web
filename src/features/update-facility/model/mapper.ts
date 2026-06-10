import type { FacilityUpdate } from '@entities/stack';
import type { FacilityUpdateForm } from './types';

export const toFacilityUpdate = (form: FacilityUpdateForm): FacilityUpdate => ({
  name: form.name,
  fuelType: form.fuelType,
  fuelUsage: form.fuelUsage,
  fuelInput: form.fuelInput,
});
