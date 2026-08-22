import { useLocation } from "react-router";

import { Building2, FlaskConical } from "lucide-react";

import {
  AppSidebar,
  SidebarBrandHeader,
  SidebarNav,
  SidebarUserFooter,
  type SidebarNavGroup,
} from "@shared/ui/sidebar";
import { useSignOut } from "@features/sign-out";
import { useAuth } from "@entities/auth";
import { PLATFORM_BRAND } from "./brand";

// ─── 메뉴 구조 (플랫폼 운영자 전용) ──────────────────────────────────────────
const PLATFORM_MENU: SidebarNavGroup[] = [
  {
    label: "platform",
    items: [
      { icon: Building2, label: "고객사 관리", path: "/platform/tenants" },
      { icon: FlaskConical, label: "측정물질 카탈로그", path: "/platform/pollutant-catalog" },
    ],
  },
];

// ─── PlatformSidebar ────────────────────────────────────────────────────────
export const PlatformSidebar = () => {
  const location = useLocation();
  const { logout } = useSignOut();
  const { user } = useAuth();

  return (
    <AppSidebar
      header={
        <SidebarBrandHeader
          icon={PLATFORM_BRAND.icon}
          title={PLATFORM_BRAND.title}
          subtitle={PLATFORM_BRAND.subtitle}
        />
      }
      footer={
        <SidebarUserFooter name={user?.name} subtitle="플랫폼 운영자" onLogout={logout} />
      }
    >
      <SidebarNav
        groups={PLATFORM_MENU}
        isActive={(item) => (item.path ? location.pathname === item.path : false)}
        isSubActive={(sub) => location.pathname === sub.path}
        isOpen={() => false}
        onToggle={() => {}}
      />
    </AppSidebar>
  );
};
