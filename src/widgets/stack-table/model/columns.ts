import { createColumnHelper } from '@tanstack/react-table';

import type { StackTableRow } from './types';

import { CustomCell, PathCell } from '../ui/Cells';

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
    header: '측정시설',
    cell: CustomCell,
  }),
  columnHelper.accessor('field', {
    header: '측정분야',
    cell: CustomCell,
  }),
  columnHelper.accessor('modifiedAt', {
    header: '수정일시',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('createdAt', {
    header: '등록일시',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'path',
    cell: PathCell,
  })
];
