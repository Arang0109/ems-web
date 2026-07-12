import type { TargetSubstanceCreate } from '@entities/stack';
import type { SubstanceRegisterForm } from './types';

import { toNumberOrNull } from '@shared/lib';

export const toSubstanceCreate = (preventionId: number, form: SubstanceRegisterForm): TargetSubstanceCreate => ({
  preventionId: preventionId,
  name: form.name,
  removalEfficiency: toNumberOrNull(form.removalEfficiency),
});
