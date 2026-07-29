import type { Prevention } from '@entities/stack';

export type PreventionUpdateForm = {
  name: string;
  capacity: string;
  targetName: string;
  removalEfficiency: string;
}

export const getDefaultPreventionUpdateForm = (prevention?: Prevention): PreventionUpdateForm => ({
  name: prevention?.name ?? '',
  capacity: prevention?.capacity != null ? String(prevention.capacity) : '',
  targetName: prevention?.targetName ?? '',
  removalEfficiency: prevention?.removalEfficiency ?? '',
});
