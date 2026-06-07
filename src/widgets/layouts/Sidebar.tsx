import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router";

import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

import {
  House,
  Building2,
  FileText,
  Gauge,
  PieChart,
  Wrench,
  ChevronDown,
  LogOut,
  Activity,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSignOut } from "@features/sign-out";

// ─── 메뉴 구조 ────────────────────────────────────────────────────────────────

type SubItem = { label: string; path: string };

type MenuItem = {
  icon: React.ElementType;
  label: string;
  path?: string;
  subItems?: SubItem[];
};

const MENU_ITEMS: MenuItem[] = [
  { icon: House, label: "대시보드", path: "/dashboard" },
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
      { label: '측정 계획', path: '/measurement/plan' },
      { label: '측정 현황', path: '/measurement/status' },
      { label: '측정 이력', path: '/measurement/history' },
    ],
  },
  {
    icon: Wrench,
    label: '자원 관리',
    subItems: [
      { label: '측정인력 관리', path: '/staff' },
      { label: '측정장비 관리', path: '/equipment' },
    ],
  },
  { icon: PieChart, label: "데이터 분석", path: "/analysis" },
];

// ─── 활성 경로 판별 헬퍼 ──────────────────────────────────────────────────────

/** 현재 pathname이 해당 경로와 정확히 일치하는지 확인 */
const matchPath = (pathname: string, path: string) => pathname === path;

/** 서브메뉴 중 하나라도 현재 경로와 일치하면 true */
const hasActiveChild = (pathname: string, item: MenuItem) =>
  item.subItems?.some((sub) => matchPath(pathname, sub.path)) ?? false;

/** 현재 경로를 기준으로 열려 있어야 할 부모 메뉴를 계산 */
const getInitialOpenMenus = (pathname: string) =>
  MENU_ITEMS.reduce<Record<string, boolean>>((acc, item) => {
    if (hasActiveChild(pathname, item)) acc[item.label] = true;
    return acc;
  }, {});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export const Sidebar = () => {
  const location = useLocation();
  const { logout } = useSignOut();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() =>
    getInitialOpenMenus(location.pathname)
  );

  // 경로가 바뀔 때 활성 하위 메뉴의 상위 메뉴를 자동으로 열어 줌
  useEffect(() => {
    setOpenMenus((prev) => {
      const next = { ...prev };
      let changed = false;
      MENU_ITEMS.forEach((item) => {
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

  // TODO: 실제 사용자 정보로 교체
  const user = { name: "강민수", field: "대기 측정", initial: "강" };

  return (
    <SidebarPrimitive>
      {/* ── HEADER : 브랜드 영역 ───────────────────────────────────────────── */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              ENSolution
            </span>
            <span className="text-[11px] text-sidebar-foreground/50">
              환경 측정 관리 시스템
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* ── CONTENT : 내비게이션 ──────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-2">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel>main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) =>
                item.subItems ? (
                  // ── 서브메뉴 있는 항목
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => toggleMenu(item.label)}
                      isActive={hasActiveChild(location.pathname, item)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
                          openMenus[item.label] && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>

                    {openMenus[item.label] && (
                      <SidebarMenuSub>
                        {item.subItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.label}>
                            <SidebarMenuSubButton
                              render={<Link to={sub.path} />}
                              isActive={matchPath(location.pathname, sub.path)}
                            >
                              <span>{sub.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ) : (
                  // ── 단일 항목
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link to={item.path!} />}
                      isActive={matchPath(location.pathname, item.path!)}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── FOOTER : 사용자 정보 ──────────────────────────────────────────── */}
      <SidebarFooter className="px-2 py-2">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {user.initial}
          </div>

          {/* 이름 + 분야 */}
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            <span className="truncate text-[11px] text-sidebar-foreground/50">
              {user.field}
            </span>
          </div>

          {/* 로그아웃 */}
          <button
            onClick={logout}
            title="로그아웃"
            className="shrink-0 rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </SidebarPrimitive>
  );
};
