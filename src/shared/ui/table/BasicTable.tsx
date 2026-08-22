import type { Table } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import type { MobileCardConfig } from '@shared/model';

import { DesktopTable } from './DesktopTable';
import { MobileCardList } from './MobileCardList';

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
  /**
   * 모바일(<md) 카드 표현.
   * - 미지정 — 컬럼 순서 기반 자동 배치
   * - 설정 객체 — 제목·부제·상태·본문 필드·액션 버튼을 직접 선언
   * - `false` — 카드 없이 모든 폭에서 표를 가로 스크롤로 표시
   */
  mobileCard?: MobileCardConfig<TData> | false;
  /** 외곽 래퍼 클래스 (테두리·라운딩 제어 포함) */
  className?: string;
}

/**
 * 데스크탑 표(`DesktopTable`)와 모바일 카드(`MobileCardList`)를 폭에 따라 전환하는 조합기.
 * 두 표현을 개별로 배치해야 하는 화면은 각 컴포넌트를 직접 조합하면 된다.
 */
export const BasicTable = <TData,>({
  table,
  loading,
  error,
  emptyState,
  onRowClick,
  isRowSelected,
  mobileCard,
  className,
}: Props<TData>) => {
  const desktop = (
    <DesktopTable
      table={table}
      loading={loading}
      error={error}
      emptyState={emptyState}
      onRowClick={onRowClick}
      isRowSelected={isRowSelected}
      /* 외곽 className(테두리·라운딩)은 표 쪽에만 적용한다 */
      className={cn(mobileCard === false ? 'overflow-x-auto' : 'hidden md:block', className)}
    />
  );

  if (mobileCard === false) return desktop;

  return (
    <>
      {desktop}

      {/* 카드가 각자 테두리를 가지므로 외곽 className 은 물려주지 않는다 */}
      <MobileCardList
        className="md:hidden"
        table={table}
        config={mobileCard}
        loading={loading}
        error={error}
        emptyState={emptyState}
        onRowClick={onRowClick}
        isRowSelected={isRowSelected}
      />
    </>
  );
};
