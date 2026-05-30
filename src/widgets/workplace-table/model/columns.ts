import { createColumnHelper } from '@tanstack/react-table';

import type { WorkplaceTableCols } from './workplace-table-types';

import { CustomCell } from '../ui/Cells';

const columnHelper = createColumnHelper<WorkplaceTableCols>();

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
];
