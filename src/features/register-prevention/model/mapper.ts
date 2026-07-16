import type { PreventionCreate } from '@entities/stack';
import type { PreventionRegisterForm } from './types';

export const toPreventionCreate = (stackId: number, form: PreventionRegisterForm): PreventionCreate => ({
  stackId: stackId,
  name: form.name,
});
