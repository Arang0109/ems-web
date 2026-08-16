import type { PreventionCreate } from '@entities/stack';
import type { PreventionRegisterForm } from './types';

import { toNumberOrNull, trimValue } from '@shared/lib';

export const toPreventionCreate = (stackId: number, form: PreventionRegisterForm): PreventionCreate => ({
  stackId: stackId,
  name: trimValue(form.name),
  capacity: toNumberOrNull(form.capacity),
  unit: trimValue(form.unit),
  targetName: trimValue(form.targetName),
  removalEfficiency: trimValue(form.removalEfficiency),
});
