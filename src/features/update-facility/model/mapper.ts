import type { FacilityUpdate } from '@entities/stack';

import { trimValue } from '@shared/lib';
import type { FacilityUpdateForm } from './types';

export const toFacilityUpdate = (form: FacilityUpdateForm): FacilityUpdate => ({
  name: trimValue(form.name),
  fuelType: trimValue(form.fuelType),
  fuelUsage: trimValue(form.fuelUsage),
  fuelInput: trimValue(form.fuelInput),
  productOutput: trimValue(form.productOutput),
  incinerationAmount: trimValue(form.incinerationAmount),
  unit: trimValue(form.unit),
});
