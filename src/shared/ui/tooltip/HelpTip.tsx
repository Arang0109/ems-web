import React from "react";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tooltip } from "./Tooltip";

interface Props {
  /** 설명 본문 */
  content: React.ReactNode;
  /**
   * 접근성 이름. 화면에는 아이콘만 보이므로 **어떤 항목의 설명인지** 밝힌다.
   * (같은 화면에 "도움말" 버튼이 수십 개 놓이면 스크린리더로 구분할 수 없다)
   */
  label?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
}

/**
 * 라벨 옆 도움말 아이콘 — 전문 용어·계산식처럼 화면에 상시 노출하기엔 긴 설명을 담는다.
 *
 * 세로 여백은 `-my-1` 로 상쇄해 라벨 줄 높이를 밀지 않으면서 터치 영역만 넓힌다.
 */
export const HelpTip = ({
  content,
  label = "도움말",
  side = "top",
  align = "center",
  className,
}: Props) => (
  <Tooltip content={content} side={side} align={align}>
    <button
      type="button"
      aria-label={label}
      className={cn(
        "-my-1 shrink-0 rounded-full p-1 text-muted-ink transition-colors",
        "hover:text-ink-soft data-popup-open:text-brand-dark",
        "outline-none focus-visible:ring-3 focus-visible:ring-brand-primary/25",
        className,
      )}
    >
      <CircleHelp size={15} aria-hidden />
    </button>
  </Tooltip>
);
