import type { FacilityCreate } from '@entities/stack';
import type { FacilityRegisterForm } from './types';

export const toFacilityCreate = (stackId: number, form: FacilityRegisterForm): FacilityCreate => ({
  stackId: stackId,
  name: form.name,
  fuelType: form.fuelType,
  fuelUsage: form.fuelUsage,
  fuelInput: form.fuelInput,
  productOutput: form.productOutput,
  incinerationAmount: form.incinerationAmount,
  unit: form.unit,
});
