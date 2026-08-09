import { createColumnHelper } from '@tanstack/react-table';

import type { TeamScheduleTableRow } from './types';

import { CustomCell, PathCell } from '../ui/Cells';

const columnHelper = createColumnHelper<TeamScheduleTableRow>();

export const defaultColumns = [
  columnHelper.accessor('teamName', {
    header: '담당 팀',
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
  columnHelper.accessor('status', {
    header: '상태',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'path',
    cell: PathCell,
  })
];
