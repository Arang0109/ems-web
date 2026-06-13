import type { TargetSubstanceCreate } from '@entities/stack';
import type { SubstanceRegisterForm } from './types';

export const toSubstanceCreate = (preventionId: number, form: SubstanceRegisterForm): TargetSubstanceCreate => ({
  preventionId: preventionId,
  name: form.name,
  removalEfficiency: form.removalEfficiency,
});
