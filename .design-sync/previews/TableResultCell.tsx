import { TableInputCell, TableLabelCell, TableResultCell } from "ems-web";

/**
 * 계산 결과 셀 — 읽기 전용이고 회색 면으로 입력 셀과 구분된다.
 * `<td>` 이므로 반드시 표 안에 둔다.
 */
export const NextToInputs = () => (
  <table className="border-collapse">
    <thead>
      <tr>
        <TableLabelCell scope="col" width={130}>
          항목
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          1회차
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          2회차
        </TableLabelCell>
        <TableLabelCell scope="col" width={110}>
          평균 (자동)
        </TableLabelCell>
      </tr>
    </thead>
    <tbody>
      <tr>
        <TableLabelCell align="left">먼지(TSP)</TableLabelCell>
        <TableInputCell value="42.5" onChange={() => {}} type="number" />
        <TableInputCell value="39.8" onChange={() => {}} type="number" />
        <TableResultCell value="41.15" unit="mg/S㎥" />
      </tr>
      <tr>
        <TableLabelCell align="left">황산화물(SO₂)</TableLabelCell>
        <TableInputCell value="12.4" onChange={() => {}} type="number" />
        <TableInputCell value="11.9" onChange={() => {}} type="number" />
        <TableResultCell value="12.15" unit="ppm" />
      </tr>
    </tbody>
  </table>
);

/** 단위 없이 / `colSpan` 으로 합계 행 */
export const UnitAndSpan = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={130}>
          측정 횟수
        </TableLabelCell>
        <TableResultCell value={2} />
      </tr>
      <tr>
        <TableLabelCell align="left">보정 후 농도</TableLabelCell>
        <TableResultCell value="18.72" unit="mg/S㎥" colSpan={2} />
      </tr>
    </tbody>
  </table>
);
