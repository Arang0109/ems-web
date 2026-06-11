import { createColumnHelper, type RowData } from '@tanstack/react-table';

import type { WorkplaceTableRow } from './types';

import { CustomCell, ActionCell } from '../ui/Cells';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onViewWorkplaceDetail?: (row: WorkplaceTableRow) => void;
  }
}

const columnHelper = createColumnHelper<WorkplaceTableRow>();

export const defaultColumns = [
  columnHelper.accessor('workplaceName', {
    header: '측정대상 사업장',
    cell: CustomCell,
  }),
  columnHelper.accessor('address', {
    header: '측정대상 사업장 주소',
    cell: CustomCell,
    size: 350,
  }),
  columnHelper.accessor('bizNumber', {
    header: '사업자등록번호',
    cell: CustomCell,
    enableSorting: false,
  }),
    columnHelper.display({
      id: 'actions',
      cell: ActionCell,
    }),
];
