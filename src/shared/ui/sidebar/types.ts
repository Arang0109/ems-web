import type { ElementType } from "react";

/** 서브(하위) 내비게이션 항목 */
export type SidebarNavSubItem = {
  label: string;
  path: string;
};

/** 내비게이션 항목 — 단일 링크(`path`) 또는 부모(`subItems`) */
export type SidebarNavItem = {
  icon: ElementType;
  label: string;
  path?: string;
  subItems?: SidebarNavSubItem[];
};

/** 라벨로 묶인 내비게이션 그룹 */
export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

/** 사이드바·모바일 상단 바가 공유하는 브랜드(로고 + 이름) */
export type SidebarBrand = {
  icon: ElementType;
  title: string;
  subtitle?: string;
};
