import { cn } from "@/lib/utils";

import { BackButton } from "@shared/ui/buttons";
import { PageTitle } from "@shared/ui/semantics";
import { SidebarMenuButton } from "@shared/ui/sidebar";

/**
 * `stickyHeader` 헤더(제목줄 58px + 식별 칩 줄 25px)의 높이만큼 내려 붙이는 `top` 클래스.
 * 헤더 바로 아래에 함께 고정돼야 하는 요소(탭 목록 등)에 `sticky` 와 같이 건다 — 모바일 전용.
 */
export const PAGE_STICKY_HEADER_OFFSET = "top-20.75";

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
  /**
   * 제목줄 우측 끝 더보기(⋯) 메뉴 버튼 — 모바일(md 미만)에서만 노출한다.
   * 브랜드 상단 바를 숨기는 상세 화면(라우트 `DETAIL_ROUTE_HANDLE`)에서 사이드바 진입점을 대신한다.
   */
  showMenu?: boolean;
  /**
   * 모바일(md 미만)에서 제목 블록을 화면 상단에 고정한다 (MO 상세 시안).
   * 제목줄(58px) 아래 줄에 `subtitle` 을 두고, 본문과의 간격을 없앤다 — 본문 첫 요소(탭 목록 등)는
   * `sticky` + `PAGE_STICKY_HEADER_OFFSET` 으로 헤더 바로 아래에 이어 붙인다. 데스크탑은 기존 배치 그대로다.
   */
  stickyHeader?: boolean;
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
  showMenu,
  stickyHeader,
  className,
  children,
}: Props) => {
  const menuButton = showMenu && <SidebarMenuButton className="-mr-2 shrink-0 md:hidden" />;

  if (stickyHeader) {
    return (
      <div className={cn("min-h-full md:space-y-5", className)}>
        {/* -mx-4 px-4 : 레이아웃 좌우 여백을 넘어 전폭으로 깔아야 스크롤되는 본문이 옆으로 비치지 않는다 */}
        <div className="sticky top-0 z-20 -mx-4 bg-surface px-4 backdrop-blur-[7px] md:static md:mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <div className="flex h-14.5 items-center gap-2 md:h-auto md:items-start md:gap-3">
            {showBack && (
              <BackButton to={backTo} onClick={onBackClick} className="-ml-2 md:hidden" />
            )}

            {/* 모바일은 subtitle 을 아래 줄로 내리므로 제목 옆에는 데스크탑에서만 둔다 */}
            <PageTitle
              title={title}
              description={description}
              subtitle={subtitle && <div className="hidden md:block">{subtitle}</div>}
            />

            {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
            {menuButton}
          </div>

          {/* 높이를 고정해 두어야 PAGE_STICKY_HEADER_OFFSET 과 어긋나지 않는다 (데이터 로딩 전에도) */}
          {subtitle && <div className="flex h-6.25 items-center md:hidden">{subtitle}</div>}
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className={cn("space-y-5 min-h-full", className)}>
      <div className="flex items-start gap-2 md:gap-3">
        {/* -ml-2 -mt-1 : ghost 버튼의 여백을 상쇄해 좌측 끝·제목 첫 줄에 광학 정렬한다 */}
        {showBack && (
          <BackButton to={backTo} onClick={onBackClick} className="-ml-2 -mt-1 md:hidden" />
        )}

        <PageTitle title={title} description={description} subtitle={subtitle} />

        {actions && <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>}
        {menuButton}
      </div>

      {children}
    </div>
  );
};
