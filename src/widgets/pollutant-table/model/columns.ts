import { createColumnHelper } from '@tanstack/react-table';

import { RowActionCell } from '@shared/ui/table';

import type { PollutantTableRow } from './types';

const columnHelper = createColumnHelper<PollutantTableRow>();

export const defaultColumns = [
  columnHelper.accessor('field', {
    header: '측정 분야',
  }),
  columnHelper.accessor('code', {
    header: '항목 코드',
  }),
  columnHelper.accessor('nameKr', {
    header: '측정물질(한글)',
  }),
  columnHelper.accessor('nameEn', {
    header: '측정물질(영어)',
    enableSorting: false,
  }),
  columnHelper.accessor('method', {
    header: '측정 방법',
  }),
  columnHelper.accessor('equipment', {
    header: '측정 장비',
    enableSorting: false,
  }),
  columnHelper.accessor('testMethod', {
    header: '공정시험법',
  }),
  columnHelper.display({
    id: 'actions',
    cell: RowActionCell,
  }),
];
