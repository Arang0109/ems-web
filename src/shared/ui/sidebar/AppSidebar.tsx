import type { ReactNode } from "react";

import { Sidebar as SidebarPrimitive, useSidebar } from "@/components/ui/sidebar";

interface Props {
  /** 상단 브랜드 영역 */
  header: ReactNode;
  /** 본문 내비게이션 영역 */
  children: ReactNode;
  /** 하단 사용자/액션 영역 */
  footer?: ReactNode;
}

/** header / content / footer 슬롯을 하나의 사이드바로 합치는 셸 */
export const AppSidebar = ({ header, children, footer }: Props) => {
  const { isMobile } = useSidebar();

  // 모바일은 피그마 MO 시안(메뉴오픈_MO)대로 우측에서 열리는 오프캔버스로 둔다
  return (
    <SidebarPrimitive side={isMobile ? "right" : "left"}>
      {header}
      {children}
      {footer}
    </SidebarPrimitive>
  );
};
