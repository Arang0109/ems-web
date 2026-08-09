import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  className?: string;
}

/**
 * 자동계산 결과 표시 행 — 좌측 설명 라벨, 우측 값(+단위).
 * 피그마의 "자동 환산 · 756.9 mmHg", "무게차이 자동계산 · 0.23 g" 패턴.
 */
export const CalcResultRow = ({ label, value, unit, className }: Props) => (
  <div className={cn("flex items-center justify-between gap-2", className)}>
    <span className="text-label text-muted-ink">{label}</span>
    <span className="flex items-center gap-0.5 text-label text-ink-soft">
      <span>{value}</span>
      {unit && <span>{unit}</span>}
    </span>
  </div>
);
