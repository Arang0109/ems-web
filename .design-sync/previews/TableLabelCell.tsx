import { TableInputCell, TableLabelCell, TableResultCell } from "ems-web";

/**
 * 기록지형 표의 행·열 머리 셀. `<th>` 이므로 반드시 표 안에 둔다.
 * 행 머리는 `scope="row"`(기본), 열 머리는 `scope="col"` 이다 —
 * 생김새는 같고 스크린리더의 연결 방향만 다르다.
 */
export const ColumnAndRowHeaders = () => (
  <table className="border-collapse">
    <thead>
      <tr>
        <TableLabelCell scope="col" width={120}>
          항목
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          1회차
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          2회차
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          평균
        </TableLabelCell>
      </tr>
    </thead>
    <tbody>
      <tr>
        <TableLabelCell align="left">먼지(TSP)</TableLabelCell>
        <TableInputCell value="42.5" onChange={() => {}} unit="mg/S㎥" />
        <TableInputCell value="39.8" onChange={() => {}} unit="mg/S㎥" />
        <TableResultCell value="41.2" unit="mg/S㎥" />
      </tr>
    </tbody>
  </table>
);

/** 라벨 옆 도움말 — 용어 설명·계산식처럼 상시 노출하기엔 긴 안내 */
export const WithHint = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={160} hint="측정값을 동일 기준으로 비교하기 위한 보정 산소농도입니다.">
          표준산소농도
        </TableLabelCell>
        <TableResultCell value="6" unit="%" />
      </tr>
    </tbody>
  </table>
);

/** `colSpan`·`rowSpan` — 회차 묶음 머리 */
export const Spans = () => (
  <table className="border-collapse">
    <thead>
      <tr>
        <TableLabelCell scope="col" rowSpan={2} width={120}>
          항목
        </TableLabelCell>
        <TableLabelCell scope="col" colSpan={2}>
          측정 회차
        </TableLabelCell>
      </tr>
      <tr>
        <TableLabelCell scope="col" width={110}>
          1회차
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          2회차
        </TableLabelCell>
      </tr>
    </thead>
    <tbody>
      <tr>
        <TableLabelCell align="left">황산화물(SO₂)</TableLabelCell>
        <TableResultCell value="12.4" />
        <TableResultCell value="11.9" />
      </tr>
    </tbody>
  </table>
);
