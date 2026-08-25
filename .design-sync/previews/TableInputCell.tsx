import { TableInputCell, TableLabelCell } from "ems-web";

/**
 * 기록지형 표의 입력 셀. `<td>` 이므로 반드시 표 안에 둔다.
 * `type="number"` 는 `NumericField`, `"time"` 은 `TimeField` 로 렌더된다.
 */
export const Types = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={140}>
          측정 시작시각
        </TableLabelCell>
        <TableInputCell value="09:30" onChange={() => {}} type="time" />
      </tr>
      <tr>
        <TableLabelCell align="left">배출가스 온도</TableLabelCell>
        <TableInputCell value="128" onChange={() => {}} type="number" unit="℃" min={0} />
      </tr>
      <tr>
        <TableLabelCell align="left">측정자</TableLabelCell>
        <TableInputCell value="이서연" onChange={() => {}} />
      </tr>
    </tbody>
  </table>
);

/** 상태 색 — 의미는 호출부가 정한다 (`UnitField` 와 같은 계약) */
export const Tones = () => (
  <table className="border-collapse">
    <tbody>
      <tr>
        <TableLabelCell align="left" width={140}>
          정상
        </TableLabelCell>
        <TableInputCell value="42.5" onChange={() => {}} type="number" unit="mg/S㎥" />
      </tr>
      <tr>
        <TableLabelCell align="left">확인 필요</TableLabelCell>
        <TableInputCell value="0" onChange={() => {}} type="number" unit="mg/S㎥" tone="info" />
      </tr>
      <tr>
        <TableLabelCell align="left">기준 초과</TableLabelCell>
        <TableInputCell value="812.0" onChange={() => {}} type="number" unit="mg/S㎥" tone="danger" />
      </tr>
      <tr>
        <TableLabelCell align="left">비활성</TableLabelCell>
        <TableInputCell value="" onChange={() => {}} placeholder="미입력" disabled />
      </tr>
    </tbody>
  </table>
);
