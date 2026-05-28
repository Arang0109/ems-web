import { createColumnHelper, type FilterFn } from '@tanstack/react-table';

import type { workplaceTableD } from '@entities/workplace';
import type { ContractStatus } from '@shared/model';

import { CustomCell, StatusCell, PathCell } from '../ui/Cells';

const statusFilterFn: FilterFn<workplaceTableD> = (row, _columnId, filterValue: Set<ContractStatus>) =>
  filterValue.has(row.getValue('status'));

const columnHelper = createColumnHelper<workplaceTableD>();

export const defaultColumns = [
  columnHelper.accessor('workplaceName', {
    header: '사업장명',
    cell: CustomCell,
  }),
  columnHelper.accessor('companyName', {
    header: '거래처명',
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
