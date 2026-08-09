import type { FacilityCreate } from '@entities/stack';

import { trimValue } from '@shared/lib';
import type { FacilityRegisterForm } from './types';

export const toFacilityCreate = (stackId: number, form: FacilityRegisterForm): FacilityCreate => ({
  stackId: stackId,
  name: trimValue(form.name),
  fuelType: trimValue(form.fuelType),
  fuelUsage: trimValue(form.fuelUsage),
  fuelInput: trimValue(form.fuelInput),
  productOutput: trimValue(form.productOutput),
  incinerationAmount: trimValue(form.incinerationAmount),
  unit: trimValue(form.unit),
});
