import { HelpTip } from "@shared/ui/tooltip";
import { cn } from "@/lib/utils";

import { STICKY_CELL_CLASS } from "./cell-face";

/**
 * 고정 셀의 배경 — 기본 `bg-rule-dark/20` 은 반투명이라 밑으로 지나가는 값이 비친다.
 * 같은 색을 `surface` 위에 섞어 불투명하게 만든다.
 */
const STICKY_LABEL_BG = "bg-[color-mix(in_srgb,var(--color-rule-dark)_20%,var(--color-surface))]";

interface Props {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  /**
   * 셀이 이름을 주는 대상. 행 머리는 `row`(기본), 열 머리는 `col` 이다.
   * 두 자리의 생김새가 같아 한 컴포넌트가 맡는다 — 다른 건 스크린리더의 연결 방향뿐이다.
   */
  scope?: "row" | "col" | "colgroup";
  /** 가로 정렬. 이름이 길어 왼쪽으로 흘려야 하는 행 머리에만 `left` 를 쓴다 */
  align?: "center" | "left";
  /** 열 폭 (px) — 가로 스크롤 표에서 항목별로 다르게 준다 */
  width?: number;
  /** 라벨 옆 도움말 — 용어 설명·계산식 */
  hint?: React.ReactNode;
  /** 도움말 아이콘의 접근성 이름 (라벨이 문자열이 아닐 때 지정) */
  hintLabel?: string;
  /** 가로 스크롤 시 이 left(px)에 고정한다 — `InputTable` 이 앞 열 폭의 합으로 계산해 넘긴다 */
  stickyLeft?: number;
}

// 기록지형 테이블의 행/열 라벨 셀
export const TableLabelCell = ({
  children, colSpan, rowSpan, scope = "row", align = "center", width, hint, hintLabel, stickyLeft,
}: Props) => (
  <th
    scope={scope}
    colSpan={colSpan}
    rowSpan={rowSpan}
    style={{ width, left: stickyLeft }}
    className={cn(
      "bg-rule-dark/20 border border-rule p-1 md:p-2",
      "text-label text-ink whitespace-nowrap",
      align === "left" ? "text-left" : "text-center",
      stickyLeft !== undefined && [STICKY_CELL_CLASS, STICKY_LABEL_BG],
    )}
  >
    {hint ? (
      <span className="inline-flex items-center gap-1">
        {children}
        <HelpTip
          content={hint}
          label={hintLabel ?? (typeof children === "string" ? `${children} 설명` : "항목 설명")}
        />
      </span>
    ) : (
      children
    )}
  </th>
);
