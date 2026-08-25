import { TableLabelCell, TableSelectCell } from "ems-web";

const METHODS = [
  { value: "STANDARD", label: "표준법" },
  { value: "AUTO", label: "자동측정" },
  { value: "MANUAL", label: "수동측정" },
];

/**
 * 기록지형 표의 선택 셀 — 입력 셀과 같은 프레임을 유지한다.
 * `<td>` 이므로 반드시 표 안에 둔다.
 */
export const Default = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={140}>
          측정 방법
        </TableLabelCell>
        <TableSelectCell value="STANDARD" onChange={() => {}} options={METHODS} />
      </tr>
      <tr>
        <TableLabelCell align="left">미선택</TableLabelCell>
        <TableSelectCell value="" onChange={() => {}} options={METHODS} placeholder="방법 선택" />
      </tr>
    </tbody>
  </table>
);

/** 상태 색·비활성 — `UnitField`·`TableInputCell` 과 같은 계약 */
export const TonesAndDisabled = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={140}>
          확인 필요
        </TableLabelCell>
        <TableSelectCell value="AUTO" onChange={() => {}} options={METHODS} tone="info" />
      </tr>
      <tr>
        <TableLabelCell align="left">오류</TableLabelCell>
        <TableSelectCell value="" onChange={() => {}} options={METHODS} placeholder="선택 필요" tone="danger" />
      </tr>
      <tr>
        <TableLabelCell align="left">비활성</TableLabelCell>
        <TableSelectCell value="MANUAL" onChange={() => {}} options={METHODS} disabled />
      </tr>
    </tbody>
  </table>
);
