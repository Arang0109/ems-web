import { useState, useEffect } from "react";
import { useLocation } from "react-router";

import {
  LayoutDashboard,
  Building2,
  FileText,
  Gauge,
  PieChart,
  Wrench,
  Activity,
  Award,
} from "lucide-react";

import {
  AppSidebar,
  SidebarBrandHeader,
  SidebarNav,
  SidebarUserFooter,
  type SidebarNavGroup,
  type SidebarNavItem,
  type SidebarNavSubItem,
} from "@shared/ui/sidebar";
import { useSignOut } from "@features/sign-out";
import { useAuth, isAdmin } from "@entities/auth";
import type { UserRole } from "@entities/auth";

// ─── 메뉴 구조 ────────────────────────────────────────────────────────────────

/** 노출 role 제어를 위해 공통 NavItem에 `roles`를 확장 */
type MenuItem = SidebarNavItem & {
  /** 노출 허용 role. 미지정 시 전 사용자에게 노출 */
  roles?: UserRole[];
};

const MAIN_MENU_ITEMS: MenuItem[] = [
  { icon: LayoutDashboard, label: "대시보드", path: "/dashboard" },
  {
    icon: Building2,
    label: "기준정보",
    subItems: [
      { label: "거래처 관리", path: "/clients" },
      { label: "측정시설 조회", path: "/stacks" },
      { label: "측정물질 관리", path: "/pollutants" },
    ],
  },
  {
    icon: FileText,
    label: "계약",
    subItems: [
      { label: '계약서 조회', path: '/contracts' },
      { label: '계약서 등록', path: '/contracts/register' },
    ],
  },
  {
    icon: Gauge,
    label: '측정',
    subItems: [
      { label: '측정 계획', path: '/schedule' },
      { label: '측정 현황', path: '/measurement/status' },
      { label: '측정 이력', path: '/measurement/history' },
    ],
  },
  {
    icon: Wrench,
    label: '자원 관리',
    subItems: [
      { label: '팀 관리', path: '/staff' },
      { label: '측정장비 관리', path: '/equipment' },
    ],
  },
  { icon: PieChart, label: "데이터 분석", path: "/analysis" },
];

const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    icon: Award,
    label: "관리자",
    roles: ["ADMIN"],
    subItems: [
      { label: "회원 관리", path: "/admin/members" },
    ],
  },
];

/** 유저 role 기준으로 노출 가능한 메뉴만 필터링 */
const filterMenuByRole = (items: MenuItem[], role?: string | null) =>
  items.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((allowed) => (allowed === "ADMIN" ? isAdmin(role) : allowed === role));
  });

// ─── 활성 경로 판별 헬퍼 ──────────────────────────────────────────────────────

/** 현재 pathname이 해당 경로와 정확히 일치하는지 확인 */
const matchPath = (pathname: string, path: string) => pathname === path;

/** 서브메뉴 중 하나라도 현재 경로와 일치하면 true */
const hasActiveChild = (pathname: string, item: SidebarNavItem) =>
  item.subItems?.some((sub) => matchPath(pathname, sub.path)) ?? false;

/** 현재 경로를 기준으로 열려 있어야 할 부모 메뉴를 계산 */
const getInitialOpenMenus = (pathname: string, items: MenuItem[]) =>
  items.reduce<Record<string, boolean>>((acc, item) => {
    if (hasActiveChild(pathname, item)) acc[item.label] = true;
    return acc;
  }, {});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useSignOut();
  const { user } = useAuth();

  const mainMenu = filterMenuByRole(MAIN_MENU_ITEMS, user?.role);
  const adminMenu = filterMenuByRole(ADMIN_MENU_ITEMS, user?.role);

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => ({
    ...getInitialOpenMenus(location.pathname, MAIN_MENU_ITEMS),
    ...getInitialOpenMenus(location.pathname, ADMIN_MENU_ITEMS),
  }));

  // 경로가 바뀔 때 활성 하위 메뉴의 상위 메뉴를 자동으로 열어 줌
  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      let changed = false;
      [...MAIN_MENU_ITEMS, ...ADMIN_MENU_ITEMS].forEach((item) => {
        if (hasActiveChild(location.pathname, item) && !next[item.label]) {
          next[item.label] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [location.pathname]);

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  // 표시할 그룹 구성 (admin 메뉴는 노출 항목이 있을 때만)
  const groups: SidebarNavGroup[] = [
    { label: "main", items: mainMenu },
    ...(adminMenu.length > 0 ? [{ label: "admin", items: adminMenu }] : []),
  ];

  return (
    <AppSidebar
      header={
        <SidebarBrandHeader icon={Activity} title="EnvBridge" subtitle="환경 측정 관리 시스템" />
      }
      footer={
        <SidebarUserFooter name={user?.name} subtitle={user?.tenant} onLogout={logout} />
      }
    >
      <SidebarNav
        groups={groups}
        isActive={(item) =>
          item.path
            ? matchPath(location.pathname, item.path)
            : hasActiveChild(location.pathname, item)
        }
        isSubActive={(sub: SidebarNavSubItem) => matchPath(location.pathname, sub.path)}
        isOpen={(item) => !!openMenus[item.label]}
        onToggle={(item) => toggleMenu(item.label)}
      />
    </AppSidebar>
  );
};
