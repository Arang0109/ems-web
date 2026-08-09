import type { Table } from '@tanstack/react-table';

import { cn } from '@/lib/utils';

import { TablePagination } from './TablePagination';

interface Props<TData> {
  table: Table<TData>;
  /** 좌측 건수 라벨 대체 (예: `총 12건 · 선택 3건`). 미지정 시 `총 N건` */
  summary?: React.ReactNode;
  className?: string;
}

/**
 * 테이블 하단 바 — 좌: 필터링된 건수, 우: 페이지네이션.
 * 피그마 기준 높이 28px(페이지네이션 버튼이 결정), 테이블과의 간격 10px.
 *
 * `min-h-7`(고정 h-7 아님): 호출부가 `className` 으로 패딩을 얹어도 내용이 눌리지 않게 한다.
 * 페이지가 1장이면 페이지네이션이 렌더되지 않으므로 최소 높이로 28px 를 유지한다.
 * 배경은 셸(`TablePanel`)이나 호출부가 정한다.
 */
export const TableFooterBar = <TData,>({ table, summary, className }: Props<TData>) => (
  /* flex-wrap — 모바일(390px)에서 페이지 수가 많으면 페이지네이션이 넘치므로 두 줄로 접는다 */
  <div className={cn('flex min-h-7 flex-wrap items-center justify-between gap-2', className)}>
    <span className="inline-flex items-center gap-0.5 text-caption text-muted-ink leading-none">
      {summary ?? (
        <>
          총 <span className="font-semibold text-muted-ink">{table.getFilteredRowModel().rows.length}</span>건
        </>
      )}
    </span>
    <TablePagination table={table} />
  </div>
);
