import { createColumnHelper } from '@tanstack/react-table';

import type { StackTableRow } from './types';

import { CustomCell } from '../ui/Cells';
import { RowActionCell } from '@shared/ui/table';

const columnHelper = createColumnHelper<StackTableRow>();

export const defaultColumns = [
  columnHelper.accessor('clientName', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
    enableGlobalFilter: false,
    enableSorting: false,
  }),
  columnHelper.accessor('workplaceName', {
    header: '측정대상 사업장',
    cell: CustomCell,
    enableGlobalFilter: false,
    enableSorting: false,
  }),
  columnHelper.accessor('stackName', {
    header: '측정지점(굴뚝)',
    cell: CustomCell,
  }),
  columnHelper.accessor('field', {
    header: '측정분야',
    size: 10,
    cell: CustomCell,
  }),
  columnHelper.accessor('createdAt', {
    header: '등록일',
    size: 10,
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('modifiedAt', {
    header: '수정일',
    size: 10,
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.display({
    header: '비고',
    id: 'actions',
    size: 10,
    cell: RowActionCell,
  })
];
