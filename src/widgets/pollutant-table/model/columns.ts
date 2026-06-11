import { createColumnHelper, type RowData } from '@tanstack/react-table';

import type { PollutantTableRow } from './types';

import { CustomCell, ActionCell } from '../ui/Cells';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onViewPollutantDetail?: (row: PollutantTableRow) => void;
  }
}

const columnHelper = createColumnHelper<PollutantTableRow>();

export const defaultColumns = [
  columnHelper.accessor('field', {
    header: '측정 분야',
    cell: CustomCell,
  }),
  columnHelper.accessor('nameKr', {
    header: '측정물질(한글)',
    cell: CustomCell,
  }),
  columnHelper.accessor('nameEn', {
    header: '측정물질(영어)',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('method', {
    header: '측정 방법',
    cell: CustomCell,
  }),
  columnHelper.accessor('equipment', {
    header: '측정 장비',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('testMethod', {
    header: '공정시험법',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ActionCell,
  }),
];
