import { MoreHorizontal } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { IconButton } from "@shared/ui/buttons";

import type { SidebarBrand } from "./types";

interface Props {
  /** 좌측에 노출할 브랜드(로고 + 이름) */
  brand: SidebarBrand;
}

/**
 * 모바일 전용 상단 바 — 피그마 MO 시안 GNB(높이 58px, 하단 Rule 선, 블러).
 *
 * 좌측은 브랜드 로고, 우측 더보기(⋯) 버튼이 사이드바를 오프캔버스로 연다.
 * 페이지 제목은 본문(`PageLayout`)이 그대로 노출하므로 여기서 다루지 않는다.
 * 데스크탑(`md` 이상)에서는 상시 사이드바가 있으므로 숨긴다.
 */
export const SidebarMobileBar = ({ brand }: Props) => {
  const { setOpenMobile } = useSidebar();
  const { icon: BrandIcon } = brand;

  return (
    <header className="sticky top-0 z-30 flex h-14.5 items-center justify-between gap-3 border-b border-rule bg-surface/90 px-4 backdrop-blur-[7px] md:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-nav bg-brand-primary text-surface">
          <BrandIcon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-h3 text-ink">{brand.title}</span>
          {brand.subtitle && (
            <span className="truncate text-caption text-muted-ink">{brand.subtitle}</span>
          )}
        </div>
      </div>

      <IconButton
        icon={<MoreHorizontal className="size-4.75" />}
        label="메뉴 열기"
        onClick={() => setOpenMobile(true)}
        className="shrink-0"
      />
    </header>
  );
};
