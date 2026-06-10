import type { PreventionCreate } from '@entities/stack';
import type { PreventionRegisterForm } from './types';

export const toPreventionCreate = (form: PreventionRegisterForm): PreventionCreate => ({
  name: form.name,
});
