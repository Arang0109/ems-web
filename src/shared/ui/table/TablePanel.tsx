import { cn } from '@/lib/utils';

import { Panel } from '@shared/ui/cards';

interface Props {
  /** 패널 제목. `title`·`subtitle`·`actions` 모두 없으면 헤더를 렌더하지 않는다 */
  title?: React.ReactNode;
  /** 제목 아래 보조 문구 (상위 선택 항목명, 안내 문구 등) */
  subtitle?: React.ReactNode;
  /** 헤더 우측 슬롯 — 검색 필드·등록 버튼 등 */
  actions?: React.ReactNode;
  /** 하단 바 슬롯 — 보통 `<TableFooterBar table={table} />`. 조건부 렌더는 호출부 책임 */
  footer?: React.ReactNode;
  className?: string;
  /** 본문 — `BasicTable` 또는 선택 가드 분기 */
  children: React.ReactNode;
}

/**
 * 테이블 위젯의 공통 셸 — 헤더(제목·부제목·액션) + 본문 + 하단 바.
 * 모든 슬롯이 `ReactNode` 이므로 도메인 문자열·컴포넌트는 호출부가 주입한다.
 */
export const TablePanel = ({ title, subtitle, actions, footer, className, children }: Props) => {
  const hasHeader = Boolean(title || subtitle || actions);

  return (
    <Panel className={cn('flex flex-col', className)}>
      {hasHeader && (
        <header className="flex flex-wrap items-center justify-between gap-3 bg-canvas p-2">
          <div className="min-w-0">
            {title && <h2 className="text-h3 text-ink">{title}</h2>}
            {subtitle && <div className="mt-0.5">{subtitle}</div>}
          </div>
          {actions && <div className="flex items-center justify-end gap-2">{actions}</div>}
        </header>
      )}

      <div className="pb-2.5 bg-canvas">{children}</div>
      {footer && <div className="bg-canvas">{footer}</div>}
    </Panel>
  );
};
