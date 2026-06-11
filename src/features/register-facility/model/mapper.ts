import type { FacilityCreate } from '@entities/stack';
import type { FacilityRegisterForm } from './types';

export const toFacilityCreate = (form: FacilityRegisterForm): FacilityCreate => ({
  name: form.name,
  fuelType: form.fuelType,
  fuelUsage: form.fuelUsage,
  fuelInput: form.fuelInput,
});
