import { LogOut } from "lucide-react";

import { SidebarFooter } from "@/components/ui/sidebar";
import { ThemeToggle } from "@shared/ui/theme";

interface Props {
  name?: string;
  subtitle?: string;
  onLogout: () => void;
}

/** 사이드바 하단 사용자 정보 + 로그아웃 영역 */
export const SidebarUserFooter = ({ name, subtitle, onLogout }: Props) => (
  <SidebarFooter className="px-2 py-2">
    <div className="flex items-center gap-3">
      {/* 아바타 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-label text-muted-foreground">
        {name?.charAt(0) || "?"}
      </div>

      {/* 이름 + 부제 */}
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-body-4 text-sidebar-foreground">
          {name}
        </span>
        <span className="truncate text-caption text-sidebar-foreground/50">
          {subtitle}
        </span>
      </div>

      {/* 테마 토글 */}
      <ThemeToggle />

      {/* 로그아웃 */}
      <button
        onClick={onLogout}
        title="로그아웃"
        className="shrink-0 rounded-button p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  </SidebarFooter>
);
