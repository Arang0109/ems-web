import type { Prevention } from '@entities/stack';

import { toFormValue } from "@shared/lib";

export type PreventionUpdateForm = {
  name: string;
  capacity: string;
  targetName: string;
  removalEfficiency: string;
}

export const getDefaultPreventionUpdateForm = (prevention?: Prevention): PreventionUpdateForm => ({
  name: prevention?.name ?? '',
  capacity: toFormValue(prevention?.capacity),
  targetName: prevention?.targetName ?? '',
  removalEfficiency: prevention?.removalEfficiency ?? '',
});
