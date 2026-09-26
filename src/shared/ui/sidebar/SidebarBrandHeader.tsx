import type { ElementType } from "react";

import { cn } from "@/lib/utils";

import { SidebarHeader } from "@/components/ui/sidebar";

interface Props {
  icon: ElementType;
  /** 아이콘 크기 덮어쓰기 (`SidebarBrand.iconClassName`) */
  iconClassName?: string;
  title: string;
  subtitle?: string;
}

/** 사이드바 상단 브랜드(로고 + 타이틀) 영역 */
export const SidebarBrandHeader = ({ icon: Icon, iconClassName, title, subtitle }: Props) => (
  <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-nav bg-brand-primary text-surface">
        <Icon className={cn("size-4", iconClassName)} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-body-1 tracking-tight text-sidebar-foreground">
          {title}
        </span>
        {subtitle && (
          <span className="text-caption text-sidebar-foreground/50">{subtitle}</span>
        )}
      </div>
    </div>
  </SidebarHeader>
);
