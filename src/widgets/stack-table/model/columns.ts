import { createColumnHelper } from '@tanstack/react-table';

import type { StackTableCols } from './stack-table-types';

import { CustomCell, PathCell } from '../ui/Cells';

const columnHelper = createColumnHelper<StackTableCols>();

export const defaultColumns = [
  columnHelper.accessor('companyName', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
  }),
  columnHelper.accessor('workplaceName', {
    header: '측정대상 사업장',
    cell: CustomCell,
  }),
  columnHelper.accessor('stackName', {
    header: '측정시설',
    cell: CustomCell,
  }),
  columnHelper.accessor('field', {
    header: '측정분야',
    cell: CustomCell,
    size: 350,
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
