import { createColumnHelper } from '@tanstack/react-table';

import { RowActionCell } from '@shared/ui/table';

import { CodeCell, StatusCell } from '../ui/Cells';
import type { PollutantCatalogTableRow } from './types';

const columnHelper = createColumnHelper<PollutantCatalogTableRow>();

export const defaultColumns = [
  columnHelper.accessor('code', {
    header: '코드',
    cell: CodeCell,
  }),
  columnHelper.accessor('field', {
    header: '측정 분야',
  }),
  columnHelper.accessor('nameKr', {
    header: '측정물질(한글)',
  }),
  columnHelper.accessor('method', {
    header: '측정 방법',
  }),
  columnHelper.accessor('sortOrder', {
    header: '노출 순서',
  }),
  // 정렬 대상은 라벨('사용 중'·'폐지됨')이고 셀만 상태 점으로 그린다
  columnHelper.accessor('statusLabel', {
    header: '상태',
    cell: StatusCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: RowActionCell,
  }),
];
