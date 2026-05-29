import { createColumnHelper } from '@tanstack/react-table';

import type { WorkplaceTableD } from '@entities/workplace';

import { CustomCell, PathCell } from '../ui/Cells';

const columnHelper = createColumnHelper<WorkplaceTableD>();

export const defaultColumns = [
  columnHelper.accessor('companyName', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
  }),
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
    id: 'path',
    cell: PathCell,
  })
];
