import React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

interface TabOption {
  value: string;
  label: string;
  content: React.ReactNode;
  /** 이 탭만 카드 셸을 끄고 싶을 때. 지정하지 않으면 contentPanel 을 따른다. */
  panel?: boolean;
}

interface Props {
  options: TabOption[];
  /** 탭 본문을 카드 셸로 감쌀지 여부의 기본값. 본문이 자체 카드를 가지면 false 로 끈다. */
  contentPanel?: boolean;
  /**
   * 비활성 탭의 본문을 DOM 에 남길지. 기본값 `false`(Base UI 기본)면 탭을 벗어날 때
   * 본문이 언마운트되어 **작성 중이던 폼 입력이 사라진다.**
   * 탭을 오가며 유지해야 하는 입력 폼이 있으면 켠다 — 대신 모든 탭이 처음부터 마운트되므로
   * 각 탭이 스스로 데이터를 조회하는 화면에서는 켜지 않는다.
   */
  keepMounted?: boolean;
  className?: string;
}

/**
 * 피그마 언더라인형 탭.
 *
 * shadcn 래퍼(@/components/ui/tabs)를 거치지 않고 Base UI 동작 레이어를 직접 사용한다
 * (스타일 레이어만 걷어내고 포커스·키보드 내비게이션·ARIA 는 그대로 유지).
 * 활성 탭은 브랜드 글씨 + 하단 2px 바로 표시한다.
 */
export const Tabs = ({ options, contentPanel = true, keepMounted = false, className }: Props) => {
  const defaultValue = options[0]?.value;

  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      className={cn("flex flex-col", className)}
    >
      <TabsPrimitive.List className="flex border-b border-rule">
        {options.map((opt) => (
          <TabsPrimitive.Tab
            key={opt.value}
            value={opt.value}
            className={cn(
              "relative flex-1 px-3 py-3.5 text-body-4 whitespace-nowrap text-muted-ink transition-colors",
              "outline-none hover:text-ink-soft",
              "focus-visible:ring-3 focus-visible:ring-brand-primary/25",
              "data-active:text-brand-primary",
              "after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand-primary",
              "after:opacity-0 after:transition-opacity data-active:after:opacity-100",
            )}
          >
            {opt.label}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>

      {options.map((opt) => (
        <TabsPrimitive.Panel
          key={opt.value}
          value={opt.value}
          keepMounted={keepMounted}
          className="pt-4 outline-none"
        >
          {(opt.panel ?? contentPanel) ? (
            <div className="rounded-panel bg-surface p-6 shadow-panel ring-1 ring-rule">
              {opt.content}
            </div>
          ) : (
            opt.content
          )}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
};
