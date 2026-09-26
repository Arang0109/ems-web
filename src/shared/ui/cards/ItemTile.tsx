import React from "react";

import { cn } from "@/lib/utils";

/** 조합한 이름은 CSS 가 생성되지 않으므로 정적 맵으로 고정한다. */
const TONE_CLASS = {
  /** 강조 — 선택·포함된 항목. Soft 면 + 브랜드 제목 */
  brand: { tile: "bg-brand-soft", title: "text-brand-primary" },
  /** 한 단 물러선 항목 — 옅은 선 색 면 + 보조 제목 */
  neutral: { tile: "bg-rule/50", title: "text-ink-soft" },
} as const;

export type ItemTileTone = keyof typeof TONE_CLASS;

interface Props {
  title: React.ReactNode;
  /** 제목 아래 캡션 줄 — 여러 줄이면 fragment 로 `<p>` 를 여러 개 넘긴다 */
  description?: React.ReactNode;
  tone?: ItemTileTone;
  /** 우측 액션(수정·삭제 IconButton 등) */
  actions?: React.ReactNode;
  className?: string;
}

/**
 * 목록 속 항목 하나를 담는 타일 — 제목 + 캡션 + 우측 액션.
 *
 * 피그마 "측정계획 상세 - 측정정보" 의 오염물질 항목 타일(61px, 코너 panel, 면으로만 구분하고 테두리 없음).
 * 보통 `ItemTileGrid` 의 2열 격자 안에 놓인다.
 */
export const ItemTile = ({ title, description, tone = "brand", actions, className }: Props) => (
  <div
    className={cn(
      "flex min-h-[61px] items-center justify-between gap-2 rounded-panel p-3",
      TONE_CLASS[tone].tile,
      className,
    )}
  >
    <div className="min-w-0 space-y-0.5">
      <p className={cn("text-body-1 break-words", TONE_CLASS[tone].title)}>{title}</p>
      {description && <div className="text-caption text-muted-ink">{description}</div>}
    </div>

    {actions && <div className="flex shrink-0 items-center gap-1 text-ink-soft">{actions}</div>}
  </div>
);
