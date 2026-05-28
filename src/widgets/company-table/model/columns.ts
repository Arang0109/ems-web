import { createColumnHelper, type FilterFn } from '@tanstack/react-table';

import type { Company, ContractStatus } from '@entities/company';

import { CustomCell, StatusCell, PathCell } from '../ui/Cells';

const statusFilterFn: FilterFn<Company> = (row, _columnId, filterValue: Set<ContractStatus>) =>
  filterValue.has(row.getValue('status'));

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
    size: 350,
    enableSorting: false,
  }),
  columnHelper.accessor('status', {
    header: '계약상태',
    size: 120,
    cell: StatusCell,
    filterFn: statusFilterFn,
  }),
  columnHelper.accessor('createdAt', {
    header: '등록일',
    size: 120,
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'path',
    cell: PathCell,
  })
];
