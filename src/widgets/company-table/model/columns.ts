import { createColumnHelper } from '@tanstack/react-table';

import type { Company } from '@entities/company';

import { CustomCell, StatusCell } from '../ui/Cells';

const columnHelper = createColumnHelper<Company>();

export const defaultColumns = [
  columnHelper.accessor('companyName', {
    header: '거래처명',
    cell: CustomCell,
  }),
  columnHelper.accessor('workplaceName', {
    header: '사업장명',
    cell: CustomCell,
  }),
  columnHelper.accessor('address', {
    header: '주소',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('ceoName', {
    header: '대표자명',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('bizNumber', {
    header: '사업자번호',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('createdAt', {
    header: '등록일',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'status',
    header: '상태',
    cell: StatusCell,
  }),
];
