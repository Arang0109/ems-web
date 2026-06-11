import type { Pollutant } from '@entities/pollutant';

import type { PollutantTableRow } from './types';

import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_METHOD_LABEL } from '@shared/config';

export const toPollutantRow = (col: Pollutant): PollutantTableRow => ({
  id: col.id,
  field: MEASUREMENT_FIELD_LABEL[col.field],
  nameKr: col.nameKr,
  nameEn: col.nameEn,
  method: MEASUREMENT_METHOD_LABEL[col.method],
  phase: col.phase,
  equipment: col.equipment,
  testMethod: col.testMethod
});