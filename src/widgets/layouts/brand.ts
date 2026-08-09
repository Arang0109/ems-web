import { Activity, ServerCog } from "lucide-react";

import type { SidebarBrand } from "@shared/ui/sidebar";

/** 측정업체(테넌트) 서비스 브랜드 — 사이드바 헤더 · 모바일 상단 바 공용 */
export const APP_BRAND: SidebarBrand = {
  icon: Activity,
  title: "EnvBridge",
  subtitle: "환경 측정 관리 시스템",
};

/** 플랫폼 운영자 콘솔 브랜드 */
export const PLATFORM_BRAND: SidebarBrand = {
  icon: ServerCog,
  title: "EMS 운영",
  subtitle: "플랫폼 운영자 콘솔",
};
