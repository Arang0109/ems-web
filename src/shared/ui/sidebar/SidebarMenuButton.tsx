import { MoreHorizontal } from "lucide-react";

import { useSidebar } from "@/components/ui/sidebar";
import { IconButton } from "@shared/ui/buttons";

interface Props {
  className?: string;
}

/**
 * 모바일 더보기(⋯) 버튼 — 사이드바를 오프캔버스로 연다.
 *
 * 기본은 브랜드 상단 바(`SidebarMobileBar`)가 노출하고, 브랜드 바를 숨기는 상세 화면은
 * 페이지 헤더(`PageLayout` 의 `showMenu`)가 대신 노출한다. `SidebarProvider` 안에서만 쓴다.
 */
export const SidebarMenuButton = ({ className }: Props) => {
  const { setOpenMobile } = useSidebar();

  return (
    <IconButton
      icon={<MoreHorizontal className="size-4.75" />}
      label="메뉴 열기"
      onClick={() => setOpenMobile(true)}
      className={className}
    />
  );
};
