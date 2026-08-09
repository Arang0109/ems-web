import type { CellContext, RowData } from '@tanstack/react-table';
import { Ellipsis } from 'lucide-react';

import { Button } from '@shared/ui/buttons';

/**
 * 행 상세보기 액션 셀(`상세보기` + `Ellipsis`).
 * `columnHelper.display({ id: 'actions', cell: RowActionCell })` 로 쓴다.
 *
 * 콜백은 `useDataTable({ onViewDetail })` 이 `table.options.meta` 로 주입한다.
 */
export const RowActionCell = <TData extends RowData>({ row, table }: CellContext<TData, unknown>) => (
  <Button
    type="button"
    variant="outline"
    onClick={() => table.options.meta?.onViewDetail?.(row.original)}
    startIcon={Ellipsis}
  >
    상세보기
  </Button>
);
