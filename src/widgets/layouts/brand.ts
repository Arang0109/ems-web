import { ServerCog } from "lucide-react";

import type { SidebarBrand } from "@shared/ui/sidebar";

import { LogoMark } from "./LogoMark";

/** 측정업체(테넌트) 서비스 브랜드 — 사이드바 헤더 · 모바일 상단 바 공용 */
export const APP_BRAND: SidebarBrand = {
  icon: LogoMark,
  // 마크가 세로로 길고 획이 가늘어 16px 로는 뭉개진다 — 32px 박스 안에서 22px 로 키운다
  iconClassName: "size-5.5",
  title: "EcoMetric",
  subtitle: "환경 측정 관리 시스템",
};

/** 플랫폼 운영자 콘솔 브랜드 */
export const PLATFORM_BRAND: SidebarBrand = {
  icon: ServerCog,
  title: "EMS 운영",
  subtitle: "플랫폼 운영자 콘솔",
};
