import type { TargetSubstanceCreate } from '@entities/stack';
import type { SubstanceRegisterForm } from './types';

export const toSubstanceCreate = (form: SubstanceRegisterForm): TargetSubstanceCreate => ({
  name: form.name,
  removalEfficiency: form.removalEfficiency,
});
