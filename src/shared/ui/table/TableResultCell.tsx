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
  <td colSpan={colSpan} className="border border-rule bg-canvas">
    <div className="flex items-center">
      <span className="w-full p-2 sm:px-3 sm:py-2.5 text-body-4 text-ink-soft">{value}</span>
      {unit && <span className="pr-1.5 text-caption text-muted-ink shrink-0"><i>{unit}</i></span>}
    </div>
  </td>
);
