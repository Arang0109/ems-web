import { Link } from "react-router";
import { ChevronDown } from "lucide-react";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Badge } from "@shared/ui/badges";

import type { SidebarNavGroup, SidebarNavItem, SidebarNavSubItem } from "./types";

/** 세 자리를 넘으면 폭이 메뉴 라벨을 밀어낸다 */
const NavBadge = ({ count }: { count: number }) => (
  <Badge tone="brand" className="ml-auto min-w-5 justify-center tabular-nums">
    {count > 99 ? "99+" : count}
  </Badge>
);

interface Props {
  groups: SidebarNavGroup[];
  /** 항목(단일/부모 공통)이 활성 상태인지 */
  isActive: (item: SidebarNavItem) => boolean;
  /** 서브 항목이 활성 상태인지 */
  isSubActive: (sub: SidebarNavSubItem) => boolean;
  /** 부모 항목이 펼쳐져 있는지 */
  isOpen: (item: SidebarNavItem) => boolean;
  /** 부모 항목 펼침 토글 */
  onToggle: (item: SidebarNavItem) => void;
}

/**
 * 사이드바 본문 내비게이션 — 렌더링만 담당한다.
 * 활성 판별·펼침 상태는 상위(widget)에서 predicate로 주입한다.
 */
export const SidebarNav = ({ groups, isActive, isSubActive, isOpen, onToggle }: Props) => {
  const { isMobile, setOpenMobile } = useSidebar();

  // 모바일 오프캔버스는 이동 후에도 열린 채로 남으므로 링크를 누르면 닫아 준다
  const closeOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <SidebarContent className="px-2 py-2">
      {groups.map((group) => (
        <SidebarGroup key={group.label} className="p-0">
          <SidebarGroupLabel
            className={cn("text-body-1")}>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) =>
                item.subItems ? (
                  // ── 서브메뉴 있는 항목
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      onClick={() => onToggle(item)}
                      isActive={isActive(item)}
                      className={cn("text-body-1")}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      {!!item.badge && <NavBadge count={item.badge} />}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          // ml-auto 는 한 형제만 가져야 한다 — 배지가 그 자리를 맡으면 비켜 준다
                          item.badge ? "ml-1" : "ml-auto",
                          isOpen(item) && "rotate-180"
                        )}
                      />
                    </SidebarMenuButton>

                    {isOpen(item) && (
                      <SidebarMenuSub>
                        {item.subItems.map((sub) => (
                          <SidebarMenuSubItem key={sub.label}>
                            <SidebarMenuSubButton
                              render={<Link to={sub.path} />}
                              onClick={closeOnMobile}
                              isActive={isSubActive(sub)}
                              className={cn("text-body-1")}
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
                      onClick={closeOnMobile}
                      isActive={isActive(item)}
                      className={cn("text-body-1")}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                      {!!item.badge && <NavBadge count={item.badge} />}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </SidebarContent>
  );
};
