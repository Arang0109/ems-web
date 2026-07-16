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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import type { SidebarNavGroup, SidebarNavItem, SidebarNavSubItem } from "./types";

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
export const SidebarNav = ({ groups, isActive, isSubActive, isOpen, onToggle }: Props) => (
  <SidebarContent className="px-2 py-2">
    {groups.map((group) => (
      <SidebarGroup key={group.label} className="p-0">
        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {group.items.map((item) =>
              item.subItems ? (
                // ── 서브메뉴 있는 항목
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    onClick={() => onToggle(item)}
                    isActive={isActive(item)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 transition-transform duration-200",
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
                            isActive={isSubActive(sub)}
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
                    isActive={isActive(item)}
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
    ))}
  </SidebarContent>
);
