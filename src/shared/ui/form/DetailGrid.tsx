import React from "react";

import { cn } from "@/lib/utils";

/** 조합한 이름은 CSS 가 생성되지 않으므로 정적 맵으로 고정한다. */
const GRID_COLS = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 xl:grid-cols-3",
  4: "md:grid-cols-2 xl:grid-cols-4",
  5: "md:grid-cols-2 xl:grid-cols-5",
  6: "md:grid-cols-2 xl:grid-cols-6",
} as const;

interface Props {
  /** 데스크탑 최대 열 수 (기본 3). 모바일은 항상 1열이다 */
  cols?: keyof typeof GRID_COLS;
  className?: string;
  children: React.ReactNode;
}

/**
 * `DetailRow` 전용 그리드 셸.
 *
 * 열 간격이 넓은(gap-x-8) 이유: 데스크탑 `DetailRow` 는 라벨과 값을 가로로 놓고 구분선을
 * 쓰지 않으므로, 열 사이가 좁으면 옆 열의 라벨이 이쪽 값에 붙어 읽힌다.
 * 행 간격은 반대로 데스크탑에서 좁혀(gap-y-1) 밀도를 올린다 — 모바일은 행마다 하단
 * 구분선이 있어 선끼리 붙지 않도록 gap-y-2 를 유지한다.
 *
 * `DetailRow` 의 `span` prop 이 이 그리드의 열을 기준으로 동작한다.
 */
export const DetailGrid = ({ cols = 3, className, children }: Props) => (
  <div className={cn("grid gap-x-8 gap-y-2 md:gap-y-1", GRID_COLS[cols], className)}>
    {children}
  </div>
);
