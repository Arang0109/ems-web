import React from "react";

import { cn } from "@/lib/utils";

/** 조합한 이름은 CSS 가 생성되지 않으므로 정적 맵으로 고정한다. */
const COL_SPAN = {
  1: "",
  2: "col-span-2",
} as const;

export interface InfoCell {
  label: string;
  value: React.ReactNode;
  /** 4열 그리드에서 차지할 열 수 — 주소처럼 긴 값에 쓴다 (기본 1) */
  span?: keyof typeof COL_SPAN;
}

/**
 * 카드 상단의 대표 정보 상자 — 라벨 한 줄 + 큰 값(측정시설명·의뢰기관명).
 * `aside` 는 큰 값 옆에 붙는 보조 설명(측정시설의 사업장명 등)이다.
 */
export const HighlightBox = ({
  label, value, aside,
}: { label: string; value: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="rounded-icon-tile bg-brand-soft p-3">
    <p className="text-caption text-muted-ink">{label}</p>
    <div className="flex min-w-0 flex-wrap items-center gap-x-2">
      <p className="min-w-0 text-h3 break-words text-ink">{value}</p>
      {aside && <p className="text-caption text-ink-soft">{aside}</p>}
    </div>
  </div>
);

/**
 * 라벨 위·값 아래로 쌓은 정보 셀을 4열(모바일 2열)로 늘어놓는다.
 *
 * 행을 호출부가 직접 나눠 넘기는 이유: 행 사이 구분선은 **마지막 행을 뺀** 셀에만 긋는데,
 * 한 그리드에 셀을 몰아넣으면 어느 셀이 마지막 행인지 CSS 로 알 수 없다
 * (주소처럼 두 칸을 쓰는 셀이 끼면 더 그렇다).
 */
export const InfoRows = ({ rows }: { rows: InfoCell[][] }) => (
  <div className="space-y-2">
    {rows.map((row, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {row.map((cell) => (
          <div
            key={cell.label}
            className={cn(
              "flex min-w-0 flex-col gap-1 px-3 py-2",
              rowIndex < rows.length - 1 && "border-b border-rule",
              COL_SPAN[cell.span ?? 1],
            )}
          >
            <span className="text-label text-muted-ink">{cell.label}</span>
            <span className="text-body-1 break-words text-ink">{cell.value}</span>
          </div>
        ))}
      </div>
    ))}
  </div>
);
