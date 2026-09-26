import React from "react";

import { cn } from "@/lib/utils";
import { Panel } from "./Panel";

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;

  /** 섹션 바로가기·스크롤 이동의 앵커 */
  id?: string;
  /** 제목 왼쪽 액션(수정 버튼 등) */
  action?: React.ReactNode;
  /** 헤더 우측 요소 */
  trailing?: React.ReactNode;
  className?: string;
}

/**
 * 접히지 않는 섹션 카드 — 헤더(액션 + 제목 + 우측 요소)와 구분선 아래 본문.
 *
 * `SectionAccordion` 과 **헤더·본문 여백이 같다** — 같은 화면에서 뷰포트에 따라
 * 둘을 바꿔 끼워도(모바일은 접이식, 데스크탑은 펼친 카드) 모양이 튀지 않도록 맞춰 둔다.
 * 한쪽 여백을 고치면 다른 쪽도 함께 고친다.
 */
export const SectionCard = ({ title, children, id, action, trailing, className }: Props) => (
  <Panel as="section" variant="elevated" id={id} className={cn("scroll-mt-4", className)}>
    <div className="flex items-center gap-2 p-4 md:p-5">
      {action}
      <h2 className="min-w-0 flex-1 truncate text-h3 text-ink">{title}</h2>
      {trailing}
    </div>

    <div className="space-y-4 border-t border-rule px-4 pt-3 pb-4 md:px-5 md:pt-4 md:pb-5">
      {children}
    </div>
  </Panel>
);
