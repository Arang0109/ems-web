import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table';

import { useTableState } from './use-table-state';
import type { RowDetailHandler } from '../types/table-types';

interface UseDataTableOptions<TData extends RowData> {
  data: TData[];
  /** TanStack 자체 타입 재사용 — `createColumnHelper` 의 이종 배열을 그대로 받는다 */
  columns: TableOptions<TData>['columns'];
  pageSize?: number;
  /** 행 상세보기 콜백. `table.options.meta` 로 주입되어 `RowActionCell` 이 읽는다 */
  onViewDetail?: RowDetailHandler<TData>;
  /** 드물게 필요한 TanStack 옵션 덮어쓰기 (`getRowId` 등) */
  overrides?: Partial<TableOptions<TData>>;
}

/**
 * 클라이언트 사이드 정렬·검색·페이지네이션을 갖춘 TanStack Table 인스턴스를 만든다.
 * `meta` 배선을 훅이 책임지므로 위젯이 상세보기 콜백 전달을 잊을 수 없다.
 */
export const useDataTable = <TData extends RowData>({
  data,
  columns,
  pageSize,
  onViewDetail,
  overrides,
}: UseDataTableOptions<TData>) => {
  const tableState = useTableState({ pageSize });
  const { sorting, globalFilter, pagination, setSorting, setGlobalFilter, setPagination } = tableState;

  const table = useReactTable({
    data,
    columns,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    ...overrides,

    // overrides 뒤에 둬서 overrides.meta 가 onViewDetail 을 통째로 덮지 않도록 병합한다
    meta: { onViewDetail, ...overrides?.meta },
  });

  return { table, ...tableState };
};
