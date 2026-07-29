// 기록지형 테이블의 계산 결과 셀 — read-only, 회색 배경으로 입력 셀과 구분
export const TableResultCell = ({
  value,
  unit,
  colSpan,
}: {
  value: string | number;
  unit?: React.ReactNode;
  colSpan?: number;
}) => (
  <td colSpan={colSpan} className="border border-border bg-muted/70">
    <div className="flex items-center">
      <span className="w-full p-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm font-semibold">{value}</span>
      {unit && <span className="pr-1.5 text-[10px] text-muted-foreground shrink-0"><i>{unit}</i></span>}
    </div>
  </td>
);
