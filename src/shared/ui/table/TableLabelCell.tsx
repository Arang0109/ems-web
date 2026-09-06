import { HelpTip } from "@shared/ui/tooltip";
import { cn } from "@/lib/utils";

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
}

// 기록지형 테이블의 행/열 라벨 셀
export const TableLabelCell = ({
  children, colSpan, rowSpan, scope = "row", align = "center", width, hint, hintLabel,
}: Props) => (
  <th
    scope={scope}
    colSpan={colSpan}
    rowSpan={rowSpan}
    style={width === undefined ? undefined : { width }}
    className={cn(
      "bg-rule-dark/20 border border-rule p-1 md:p-2",
      "text-label text-ink whitespace-nowrap",
      align === "left" ? "text-left" : "text-center",
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
