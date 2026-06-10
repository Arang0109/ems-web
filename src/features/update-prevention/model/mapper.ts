import type { PreventionUpdate } from '@entities/stack';
import type { PreventionUpdateForm } from './types';

export const toPreventionUpdate = (form: PreventionUpdateForm): PreventionUpdate => ({
  name: form.name,
});
