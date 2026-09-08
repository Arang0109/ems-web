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
  /**
   * 하위 경로(`/chat/12`)에서도 이 항목을 활성으로 볼지. 기본은 정확히 일치할 때만이다.
   *
   * 판별 자체는 호출부(widget)의 predicate 가 하고, 여기서는 의도만 선언한다.
   * 기존 항목에 일괄 적용하지 않는 이유는 회귀 때문이다 — 예컨대 `측정 계획`(`/schedule`)이
   * 켜지면 `/schedule/canceled` 에서 두 메뉴가 동시에 활성으로 보인다.
   */
  matchPrefix?: boolean;
  /** 우측 카운트 배지. `0`·`undefined` 면 그리지 않는다 */
  badge?: number;
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
