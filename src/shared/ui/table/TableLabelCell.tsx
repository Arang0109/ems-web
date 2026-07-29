// 기록지형 테이블의 행/열 라벨 셀
export const TableLabelCell = ({
  children,
  colSpan,
  rowSpan,
}: {
  children?: React.ReactNode;
  colSpan?: number;
  rowSpan?: number;
}) => (
  <th
    scope="row"
    colSpan={colSpan}
    rowSpan={rowSpan}
    className="bg-muted border border-border p-1 md:p-2
      text-center text-label text-foreground whitespace-nowrap"
  >
    {children}
  </th>
);
