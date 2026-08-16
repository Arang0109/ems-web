import { useMemo } from 'react';
import { flexRender, type Cell, type Row, type Table } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import type { CardContent, MobileCardColumns, MobileCardConfig } from '@shared/model';

import { deriveCardConfig } from './derive-card-config';

/* Tailwind v4 는 소스의 리터럴 클래스 문자열만 스캔한다. `grid-cols-${n}` 처럼
   조합한 이름은 CSS 가 생성되지 않으므로 정적 맵으로 고정한다. */
const GRID_COLS: Record<MobileCardColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

const COL_SPAN: Record<MobileCardColumns, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

interface Props<TData> {
  table: Table<TData>;
  /**
   * 카드 배치 선언 — 제목·부제·상태·본문 필드·액션 버튼.
   * 미지정 시 `deriveCardConfig` 의 컬럼 순서 기반 기본 배치를 쓴다.
   */
  config?: MobileCardConfig<TData>;
  /** 로딩 중 — 지정 시 빈 상태 문구 대신 로딩 표시 */
  loading?: boolean;
  error?: string | null;
  /** 행이 0건일 때 대체 노드. 미지정 시 기본 문구 */
  emptyState?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  /** 선택 강조 대상 판별 — 지정 시 해당 카드에 brand-soft 배경 */
  isRowSelected?: (row: TData) => boolean;
  /** 리스트 외곽 클래스. `BasicTable` 은 여기에 `md:hidden` 만 넘긴다 */
  className?: string;
}

/** `actions` 는 단일 값도 허용하므로 렌더 직전에 배열로 정규화한다 */
const toArray = <T,>(value: T | T[] | undefined): T[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

/**
 * 데스크탑 테이블의 모바일 대체 표현 — 행 하나를 카드 하나로 렌더한다.
 *
 * 카드에 무엇을 어떤 순서로 보여줄지는 위젯이 `config` 로 선언한다. 컬럼 정의와
 * 분리돼 있으므로 카드 전용 필드·라벨·버튼을 자유롭게 구성할 수 있고,
 * 조각을 컬럼 id 로 참조하면 데스크탑 셀 렌더러를 그대로 재사용한다.
 */
export const MobileCardList = <TData,>({
  table,
  config,
  loading,
  error,
  emptyState,
  onRowClick,
  isRowSelected,
  className,
}: Props<TData>) => {
  const columns = table.getVisibleLeafColumns();

  const layout = useMemo(
    () => config ?? deriveCardConfig(table),
    // columns 는 config 미지정 시 기본 배치의 입력이다
    [config, table, columns]
  );

  const { title, subtitle, status, fields } = layout;
  const actions = useMemo(() => toArray(layout.actions), [layout.actions]);
  const gridColumns = layout.columns ?? 1;

  /** 컬럼 id 참조 필드의 라벨 폴백 — 문자열 header, 없으면 id */
  const labelOf = (field: { label?: string; content: CardContent<TData> }) => {
    if (field.label !== undefined) return field.label;
    if (typeof field.content !== 'string') return '';
    const header = table.getColumn(field.content)?.columnDef.header;
    return typeof header === 'string' ? header : field.content;
  };

  const messageBox = (node: React.ReactNode, tone: string) => (
    <div
      className={cn(
        'rounded-panel border border-rule bg-surface py-16 text-center text-body-3',
        tone
      )}
    >
      {node}
    </div>
  );

  if (error) return <div className={className}>{messageBox(error, 'text-danger')}</div>;
  if (loading) return <div className={className}>{messageBox('불러오는 중…', 'text-muted-ink')}</div>;

  const rows = table.getRowModel().rows;

  if (rows.length === 0)
    return (
      <div className={className}>
        {emptyState ? (
          <div className="rounded-panel border border-rule bg-surface">{emptyState}</div>
        ) : (
          messageBox('검색 결과가 없습니다.', 'text-ink-soft')
        )}
      </div>
    );

  const hasHeader = Boolean(title || subtitle || status || actions.length);
  if (!hasHeader && !fields?.length) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {rows.map((row) => {
        const cellById = new Map<string, Cell<TData, unknown>>(
          row.getVisibleCells().map((cell) => [cell.column.id, cell])
        );

        /** 컬럼 id 면 그 컬럼의 데스크탑 셀을, 함수면 결과를 그대로 렌더한다 */
        const render = (content: CardContent<TData>, currentRow: Row<TData>) => {
          if (typeof content === 'function') return content(currentRow.original, table);

          const cell = cellById.get(content);
          if (!cell) {
            if (import.meta.env.DEV)
              console.warn(`[MobileCardList] 알 수 없는 컬럼 id: ${content}`);
            return null;
          }
          return flexRender(cell.column.columnDef.cell, cell.getContext());
        };

        const clickable = Boolean(onRowClick);

        return (
          <div
            key={row.id}
            /* 카드 자체를 button 으로 만들면 헤더 액션 슬롯의 실제 <button> 과 중첩되어
               무효 마크업이 되므로 div + role="button" 으로 클릭 가능 영역을 만든다 */
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            onClick={clickable ? () => onRowClick?.(row.original) : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick?.(row.original);
                    }
                  }
                : undefined
            }
            className={cn(
              'overflow-hidden rounded-panel border border-rule bg-surface shadow-panel',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/25',
              clickable && 'cursor-pointer active:bg-brand-soft',
              isRowSelected?.(row.original) && 'border-brand-primary bg-brand-soft'
            )}
          >
            {hasHeader && (
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-baseline gap-2">
                  {title && <span className="truncate text-h3 text-ink">{render(title, row)}</span>}
                  {subtitle && (
                    <span className="shrink-0 text-caption text-ink-soft">
                      {render(subtitle, row)}
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {status && render(status, row)}
                  {actions.length > 0 && (
                    // 액션 탭이 카드 전체 탭으로 번지지 않게 차단한다
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {actions.map((action, index) => (
                        <span key={typeof action === 'string' ? action : index}>
                          {render(action, row)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {fields && fields.length > 0 && (
              <div
                className={cn(
                  'grid gap-x-4 gap-y-2 px-4 pt-3 pb-4',
                  GRID_COLS[gridColumns],
                  hasHeader && 'border-t border-rule'
                )}
              >
                {fields.map((field, index) => (
                  <div
                    key={typeof field.content === 'string' ? field.content : index}
                    className={cn(
                      'min-w-0 p-3',
                      /* 칸 구분선은 1열(= 세로 목록)에서만 의미가 있다.
                         다열에서는 칸마다 밑줄이 격자처럼 보여 넣지 않는다 */
                      gridColumns === 1 && 'border-b border-rule',
                      field.span === 'full' ? 'col-span-full' : COL_SPAN[field.span ?? 1]
                    )}
                  >
                    <p className="text-label text-muted-ink">{labelOf(field)}</p>
                    <div className="mt-1 truncate text-body-1 text-ink">
                      {render(field.content, row)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
