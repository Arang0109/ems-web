import type { ElementType } from "react";

import { SidebarHeader } from "@/components/ui/sidebar";

interface Props {
  icon: ElementType;
  title: string;
  subtitle?: string;
}

/** 사이드바 상단 브랜드(로고 + 타이틀) 영역 */
export const SidebarBrandHeader = ({ icon: Icon, title, subtitle }: Props) => (
  <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-[11px] text-sidebar-foreground/50">{subtitle}</span>
        )}
      </div>
    </div>
  </SidebarHeader>
);
