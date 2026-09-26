import React from "react";

interface GroupProps {
  title: React.ReactNode;
  /** 제목 옆 건수 — 브랜드 색 "N개" 로 붙는다 */
  count?: number;
  children: React.ReactNode;
}

/**
 * `ItemTile` 묶음 하나 — 제목(+건수)과 그 아래 `ItemTileGrid` 들.
 *
 * 묶음을 형제로 늘어놓으면 사이에만 구분선이 생긴다(첫 묶음 위·마지막 묶음 아래는 비운다).
 * 상자로 감싸지 않는 이유: 카드 안에서 한 번 더 상자를 두르면 테두리가 겹겹이 쌓인다.
 */
export const ItemTileGroup = ({ title, count, children }: GroupProps) => (
  <div className="space-y-3 border-b border-rule py-5 first:pt-0 last:border-b-0 last:pb-0">
    <p className="text-body-4 text-ink">
      {title}
      {count !== undefined && <span className="text-brand-primary"> {count}개</span>}
    </p>
    <div className="space-y-2">{children}</div>
  </div>
);

interface GridProps {
  /** 격자 위 작은 라벨 ("현재 측정 항목" 등) */
  label?: React.ReactNode;
  children: React.ReactNode;
}

/** `ItemTile` 격자 — 모바일 1열, sm 이상 2열 */
export const ItemTileGrid = ({ label, children }: GridProps) => (
  <div className="space-y-1">
    {label && <p className="text-label text-muted-ink">{label}</p>}
    <div className="grid gap-2 sm:grid-cols-2">{children}</div>
  </div>
);
