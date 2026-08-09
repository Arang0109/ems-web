import { cn } from "@/lib/utils";

import { PageTitle } from "@shared/ui/semantics";

interface Props {
  title: string;
  description?: string;
  /** 제목 우측 액션 — 등록 버튼 등 */
  actions?: React.ReactNode;
  /** 세로 간격 조정 (기본 `space-y-5`) */
  className?: string;
  children: React.ReactNode;
}

/**
 * 페이지 공통 셸 — 제목 + 본문.
 *
 * 좌우·상하 여백은 레이아웃(`MainLayout`·`PlatformLayout`)이 소유하므로 여기서 주지 않는다.
 * 페이지가 다시 패딩을 걸면 이중 패딩이 된다.
 */
export const PageLayout = ({ title, description, actions, className, children }: Props) => {
  const titleNode = <PageTitle title={title} description={description} />;

  return (
    <div className={cn("space-y-5 min-h-full", className)}>
      {actions ? (
        <div className="flex items-start justify-between gap-3">
          {titleNode}
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        </div>
      ) : (
        titleNode
      )}

      {children}
    </div>
  );
};
