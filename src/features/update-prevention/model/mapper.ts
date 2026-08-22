import type { PreventionUpdate } from '@entities/stack';
import type { PreventionUpdateForm } from './types';

import { toNumberOrNull, trimValue } from '@shared/lib';

export const toPreventionUpdate = (form: PreventionUpdateForm): PreventionUpdate => ({
  name: trimValue(form.name),
  capacity: toNumberOrNull(form.capacity),
  unit: trimValue(form.unit),
  targetName: trimValue(form.targetName),
  removalEfficiency: trimValue(form.removalEfficiency),
});
