import type { PollutantCatalog } from '@entities/pollutant-catalog';

import type { PollutantCatalogTableRow } from './types';

import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_MODE_LABEL } from '@shared/config';

/** 비어 있는 선택 항목의 표시 자리. 빈 칸으로 두면 열이 무너져 보인다. */
const EMPTY = '—';

export const toPollutantCatalogRow = (col: PollutantCatalog): PollutantCatalogTableRow => ({
  id: col.id,
  code: col.code,
  field: MEASUREMENT_FIELD_LABEL[col.field],
  nameKr: col.nameKr,
  mode: col.mode ? MEASUREMENT_MODE_LABEL[col.mode] : EMPTY,
  sortOrder: col.sortOrder === null ? EMPTY : String(col.sortOrder),
  statusLabel: col.active ? '사용 중' : '폐지됨',
  // 폐지는 오류가 아니라 수명이 끝난 상태다 — danger 가 아니라 done 톤을 쓴다
  statusTone: col.active ? 'progress' : 'done',
});
