import { useState } from "react";
import { useLocation } from "react-router";

import {
  LayoutDashboard,
  Building2,
  FileText,
  Gauge,
  MessageCircle,
  Wrench,
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
import { useChatUnreadCount } from "@entities/chat";
import type { UserRole } from "@shared/model";
import { APP_BRAND } from "./brand";

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
    label: "고객사",
    subItems: [
      { label: "고객사 관리", path: "/clients" },
      { label: "측정지점(굴뚝) 조회", path: "/stacks" },
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
    ],
  },
  // 하위 경로(/chat/12)에서도 활성으로 보여야 한다 — 대화방을 열면 URL 이 바뀐다
  { icon: MessageCircle, label: '채팅', path: '/chat', matchPrefix: true },
  {
    icon: Wrench,
    label: '회사 자원',
    subItems: [
      { label: '팀 관리', path: '/staff' },
      { label: '측정장비 관리', path: '/equipment' },
      { label: "측정물질 관리", path: "/pollutants" },
    ],
  },
  {
    icon: Award,
    label: "관리자",
    roles: ["ADMIN"],
    subItems: [
      { label: "회원 관리", path: "/admin/members" },
      { label: "문서 관리", path: "/admin/documents" },
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

/** 해당 경로이거나 그 하위 경로인지 — `matchPrefix` 항목에만 쓴다 */
const matchSection = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

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

  // 사용자 id 를 모르면(이 필드가 생기기 전에 로그인해 둔 경우) 배지를 감춘다 —
  // 실시간 갱신이 없어 값이 멈춰 있으므로, 없는 것이 틀린 숫자보다 낫다.
  const { data: unreadCount } = useChatUnreadCount({ enabled: user?.userId != null });

  const mainMenu = filterMenuByRole(MAIN_MENU_ITEMS, user?.role).map((item) =>
    item.path === "/chat" ? { ...item, badge: unreadCount } : item,
  );

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => ({
    ...getInitialOpenMenus(location.pathname, MAIN_MENU_ITEMS),
  }));

  // 경로가 바뀔 때 활성 하위 메뉴의 상위 메뉴를 자동으로 열어 준다.
  // effect 안에서 동기적으로 setState 하면 cascading render 가 되므로 렌더 중에 조정한다.
  // (사용자가 접어 둔 메뉴는 건드리지 않는다 — 펼치기만 한다)
  const [activePath, setActivePath] = useState(location.pathname);
  if (activePath !== location.pathname) {
    setActivePath(location.pathname);
    setOpenMenus((prev) => {
      const next = { ...prev };
      let changed = false;
      [...MAIN_MENU_ITEMS].forEach((item) => {
        if (hasActiveChild(location.pathname, item) && !next[item.label]) {
          next[item.label] = true;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }

  const toggleMenu = (label: string) =>
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));

  // 표시할 그룹 구성 (admin 메뉴는 노출 항목이 있을 때만)
  const groups: SidebarNavGroup[] = [
    { items: mainMenu },
  ];

  return (
    <AppSidebar
      header={
        <SidebarBrandHeader
          icon={APP_BRAND.icon}
          title={APP_BRAND.title}
          subtitle={APP_BRAND.subtitle}
        />
      }
      footer={
        <SidebarUserFooter name={user?.name} subtitle={user?.tenant} onLogout={logout} />
      }
    >
      <SidebarNav
        groups={groups}
        // 서브메뉴가 있는 항목은 펼침 토글일 뿐이므로 활성 색을 주지 않는다 — 활성 표시는 하위 항목이 맡는다
        isActive={(item) =>
          item.path
            ? item.matchPrefix
              ? matchSection(location.pathname, item.path)
              : matchPath(location.pathname, item.path)
            : false
        }
        isSubActive={(sub: SidebarNavSubItem) => matchPath(location.pathname, sub.path)}
        isOpen={(item) => !!openMenus[item.label]}
        onToggle={(item) => toggleMenu(item.label)}
      />
    </AppSidebar>
  );
};
