import { cn } from "@/lib/utils";

import { BackButton } from "@shared/ui/buttons";
import { PageTitle } from "@shared/ui/semantics";

interface Props {
  title: string;
  description?: string;
  /** 제목 우측 보조 정보 — 상세 화면의 대상 식별자·상태 배지 등. 데이터는 넘기는 쪽(위젯)이 소유한다 */
  subtitle?: React.ReactNode;
  /** 제목 좌측 뒤로가기 버튼 — 모바일(md 미만)에서만 노출한다 */
  showBack?: boolean;
  /** 뒤로가기 목적지. 없으면 히스토리 뒤로(-1) */
  backTo?: string;
  /** 뒤로가기 커스텀 동작 (저장 확인 등) */
  onBackClick?: () => void;
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
 *
 * 뒤로가기(`showBack`)는 모바일에서만 노출한다 — 데스크탑은 사이드바가 상시 보이지만
 * 모바일은 오프캔버스라 상세·등록 화면에서 목록으로 돌아갈 진입점이 없다.
 */
export const PageLayout = ({
  title,
  description,
  subtitle,
  showBack,
  backTo,
  onBackClick,
  actions,
  className,
  children,
}: Props) => {
  return (
    <div className={cn("space-y-5 min-h-full", className)}>
      <div className="flex items-start gap-2 md:gap-3">
        {/* -ml-2 -mt-1 : ghost 버튼의 여백을 상쇄해 좌측 끝·제목 첫 줄에 광학 정렬한다 */}
        {showBack && (
          <BackButton to={backTo} onClick={onBackClick} className="-ml-2 -mt-1 md:hidden" />
        )}

        <PageTitle title={title} description={description} subtitle={subtitle} />

        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
};
