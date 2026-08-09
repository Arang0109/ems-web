import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

/**
 * 읽기 전용 상세 표시 행 — 좌측 라벨, 우측 값. 하단 구분선.
 *
 * 피그마 "측정계획 상세" 시안의 Input 행(모바일 48px, 라벨 12/600 Muted, 값 14/700 Ink).
 * 입력이 아닌 표시 전용이라 값은 ReactNode 를 받아 배지·칩도 그대로 넣을 수 있다.
 * 데스크탑은 파생 규칙(48px → 38px)에 따라 높이만 줄인다.
 */
export const DetailRow = ({ label, value, className }: Props) => (
  <div
    className={cn(
      "flex min-h-12 items-center justify-between gap-3 border-b border-rule p-3 md:min-h-9.5",
      className,
    )}
  >
    <span className="text-label text-muted-ink">{label}</span>
    <span className="min-w-0 text-right text-body-1 break-all text-ink">{value}</span>
  </div>
);
