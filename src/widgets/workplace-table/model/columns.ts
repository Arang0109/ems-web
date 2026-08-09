import { createColumnHelper } from '@tanstack/react-table';

import type { WorkplaceTableRow } from './types';

import { RowActionCell } from "@shared/ui/table";

import { CustomCell } from '../ui/Cells';

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
    header: '비고',
    cell: RowActionCell,
  }),
];
