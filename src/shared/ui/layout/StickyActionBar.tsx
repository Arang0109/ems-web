import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

/**
 * 긴 폼 하단에 고정되는 액션 바.
 * 배경 블러 + 상단 구분선으로 본문과 분리한다(피그마 "Background+HorizontalBorder+Shadow+OverlayBlur").
 *
 * 좌우 여백은 호출부 레이아웃에 맞춰 className 으로 주입한다.
 */
export const StickyActionBar = ({ children, className }: Props) => (
  <div
    className={cn(
      "sticky bottom-0 z-10 flex items-center justify-end gap-2",
      "border-t border-rule bg-surface/85 px-4 py-3 backdrop-blur md:px-5",
      className,
    )}
  >
    {children}
  </div>
);
