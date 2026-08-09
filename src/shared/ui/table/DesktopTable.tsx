import { flexRender, type Table } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/primitives';

import { SortIcon } from './SortIcon';

interface Props<TData> {
  table: Table<TData>;
  /** 로딩 중 — 지정 시 빈 상태 문구 대신 로딩 표시 */
  loading?: boolean;
  error?: string | null;
  /** 행이 0건일 때 본문 대체 노드. 미지정 시 기본 문구 */
  emptyState?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  /** 선택 강조 대상 판별 — 지정 시 해당 행에 brand-soft 배경 */
  isRowSelected?: (row: TData) => boolean;
  /** 외곽 래퍼 클래스. 반응형 표시 여부는 `BasicTable` 이 주입한다 */
  className?: string;
}

/** 데스크탑 표현 — 정렬 헤더를 갖춘 표. 모바일 대체 표현은 `MobileCardList` 가 담당한다. */
export const DesktopTable = <TData,>({
  table,
  loading,
  error,
  emptyState,
  onRowClick,
  isRowSelected,
  className,
}: Props<TData>) => {
  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;

  const messageRow = (node: React.ReactNode, tone: string) => (
    <TableRow>
      <TableCell colSpan={colCount} className={cn('py-16 text-center text-body-3', tone)}>
        {node}
      </TableCell>
    </TableRow>
  );

  return (
    <div className={cn('border border-rule-dark rounded-panel overflow-hidden', className)}>
      <ShadcnTable>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="bg-canvas">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={
                      header.column.columnDef.size !== undefined
                        ? { width: header.column.getSize() }
                        : undefined
                    }
                    className={canSort ? 'cursor-pointer select-none' : ''}
                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  >
                    <span className="inline-flex items-center text-label text-ink-soft">
                      {header.isPlaceholder
                        ? null
                        : <>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && <SortIcon sorted={sorted} />}
                        </>
                         }
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {error ? (
            messageRow(error, 'text-danger')
          ) : loading ? (
            messageRow('불러오는 중…', 'text-muted-ink')
          ) : rows.length === 0 ? (
            emptyState ? (
              <TableRow>
                <TableCell colSpan={colCount}>{emptyState}</TableCell>
              </TableRow>
            ) : (
              messageRow('검색 결과가 없습니다.', 'text-ink-soft')
            )
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  /* 피그마 본문 행 42px 헤더 대비 52px — 36px 액션 버튼 + 상하 8px */
                  'h-13 bg-surface',
                  onRowClick && 'cursor-pointer hover:bg-brand-soft',
                  isRowSelected?.(row.original) && 'bg-brand-soft',
                )}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-body-3 text-ink-soft">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </ShadcnTable>
    </div>
  );
};
