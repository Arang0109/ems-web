import type { Pollutant } from '@entities/pollutant';

import type { PollutantTableRow } from './types';

import {
  MEASUREMENT_FIELD_LABEL, MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL,
} from '@shared/config';

/** 가이드가 비워 둘 수 있는 항목의 표시 자리. 빈 칸으로 두면 열이 무너져 보인다. */
const EMPTY = '—';

export const toPollutantRow = (col: Pollutant): PollutantTableRow => ({
  id: col.id,
  code: col.code,
  field: MEASUREMENT_FIELD_LABEL[col.field],
  nameKr: col.nameKr,
  nameEn: col.nameEn || EMPTY,
  method: col.method ? MEASUREMENT_METHOD_LABEL[col.method] : EMPTY,
  phase: col.phase ? POLLUTANT_PHASE_LABEL[col.phase] : EMPTY,
  equipment: col.equipment || EMPTY,
  testMethod: col.testMethod || EMPTY,
});
