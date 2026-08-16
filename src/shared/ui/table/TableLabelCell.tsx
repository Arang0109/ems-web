import { HelpTip } from "@shared/ui/tooltip";

interface Props {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
  /** 라벨 옆 도움말 — 용어 설명·계산식 */
  hint?: React.ReactNode;
  /** 도움말 아이콘의 접근성 이름 (라벨이 문자열이 아닐 때 지정) */
  hintLabel?: string;
}

// 기록지형 테이블의 행/열 라벨 셀
export const TableLabelCell = ({ children, colSpan, rowSpan, hint, hintLabel }: Props) => (
  <th
    scope="row"
    colSpan={colSpan}
    rowSpan={rowSpan}
    className="bg-canvas border border-rule p-1 md:p-2
      text-center text-label text-ink whitespace-nowrap"
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
