import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
  /** 헤더 우측, chevron 앞에 놓일 보조 요소 (삭제 버튼 등) */
  action?: React.ReactNode;
  /**
   * 헤더 좌측, 토글 버튼 앞에 놓일 요소 (드래그 핸들·순위 배지 등).
   * `action` 과 마찬가지로 토글 `<button>` 바깥에 렌더한다 — 버튼 안에 버튼을 두지 않기 위해서다.
   */
  leading?: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

/**
 * SectionAccordion 안에 중첩되는 그룹 아코디언.
 * 피그마의 "흡습병·온도·흡인량", "1회 입력", "평균 자동계산값" 그룹에 해당한다.
 */
export const SubAccordion = ({
  title,
  children,
  action,
  leading,
  defaultOpen = false,
  className,
}: Props) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("overflow-hidden rounded-icon-tile bg-canvas ring-1 ring-rule", className)}>
      <div className="flex items-center gap-1 pr-3 md:pr-4">
        {leading && <div className="flex shrink-0 items-center gap-1 pl-2 md:pl-3">{leading}</div>}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-between gap-2 py-2.5 text-left",
            // leading 이 이미 왼쪽 여백을 만들므로 중복해서 밀지 않는다
            leading ? "pr-0 pl-2" : "px-3 md:px-4",
          )}
        >
          <span className="truncate text-body-4 text-ink">{title}</span>
          <ChevronDown
            size={19}
            aria-hidden
            className={cn(
              "shrink-0 text-ink-soft transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </button>
        {action}
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-rule px-3 pt-3 pb-3 md:px-4 md:pb-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
