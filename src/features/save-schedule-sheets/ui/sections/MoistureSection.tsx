import type { SheetCalcPreview } from "@entities/schedule";
import { SectionAccordion } from "@shared/ui/accordion";
import { TableLabelCell, TableInputCell, TableResultCell } from "@shared/ui/table";

import type { MoistureForm } from "../../model/types";

interface Props {
  moisture: MoistureForm;
  calc: SheetCalcPreview["moisture"] | null;
  editable: boolean;
  onChange: (patch: Partial<MoistureForm>) => void;
}

const display = (v: number | null | undefined): string => (v == null ? "-" : String(v));

// 구버전과 동일한 8열 구조: [라벨|전|후|계산] × 2묶음. "전/후 입력 → 차이·환산 계산" 패턴.
export const MoistureSection = ({ moisture, calc, editable, onChange }: Props) => (
  <SectionAccordion title="수분량 계산" defaultOpen>
    <div className="overflow-x-auto border-x border-b border-border rounded-b-lg">
      <table className="w-full border-collapse min-w-[880px] table-fixed">
        <colgroup>
          <col style={{ width: "17%" }} /><col style={{ width: "11%" }} />
          <col style={{ width: "11%" }} /><col style={{ width: "11%" }} />
          <col style={{ width: "17%" }} /><col style={{ width: "11%" }} />
          <col style={{ width: "11%" }} /><col style={{ width: "11%" }} />
        </colgroup>
        <tbody>
          <tr>
            <TableLabelCell>흡습병 무게 (g)</TableLabelCell>
            <TableInputCell type="number" value={moisture.weightBefore} placeholder="전" unit="g" step={0.01}
              onChange={(v) => onChange({ weightBefore: v })} disabled={!editable} />
            <TableInputCell type="number" value={moisture.weightAfter} placeholder="후" unit="g" step={0.01}
              onChange={(v) => onChange({ weightAfter: v })} disabled={!editable} />
            <TableResultCell value={display(calc?.ma)} unit="g" />
            <TableLabelCell>게이지압 (mmH₂O)</TableLabelCell>
            <TableInputCell type="number" value={moisture.gasMeterGaugePressure} unit="mmH₂O"
              onChange={(v) => onChange({ gasMeterGaugePressure: v })} disabled={!editable} />
            <TableResultCell value={display(calc?.pm_g)} unit="mmHg" />
            <TableResultCell value={display(calc?.pmGInchH2O)} unit="inchH₂O" />
          </tr>
          <tr>
            <TableLabelCell>온도 (°C)</TableLabelCell>
            <TableInputCell type="number" value={moisture.gasMeterTempIn} placeholder="입구" unit="°C"
              onChange={(v) => onChange({ gasMeterTempIn: v })} disabled={!editable} />
            <TableInputCell type="number" value={moisture.gasMeterTempOut} placeholder="출구" unit="°C"
              onChange={(v) => onChange({ gasMeterTempOut: v })} disabled={!editable} />
            <TableResultCell value={display(calc?.tm_g)} unit="°C" />
            <TableLabelCell>흡인유속 (m/s)</TableLabelCell>
            <TableInputCell type="number" value={moisture.suctionVelocity} unit="m/s" step={0.1} colSpan={3}
              onChange={(v) => onChange({ suctionVelocity: v })} disabled={!editable} />
          </tr>
          <tr>
            <TableLabelCell>흡인량 (L)</TableLabelCell>
            <TableInputCell type="number" value={moisture.dryGasVolumeBefore} placeholder="전" unit="L" step={0.001}
              onChange={(v) => onChange({ dryGasVolumeBefore: v })} disabled={!editable} />
            <TableInputCell type="number" value={moisture.dryGasVolumeAfter} placeholder="후" unit="L" step={0.001}
              onChange={(v) => onChange({ dryGasVolumeAfter: v })} disabled={!editable} />
            <TableResultCell value={display(calc?.vm_g)} unit="L" />
            <TableLabelCell>수분량 (%)</TableLabelCell>
            <TableResultCell value={display(calc?.xw)} unit="%" colSpan={3} />
          </tr>
          {/* 수분 채취 시각은 시트별 값이다. 입자상과 달리 지점별 채취시간 합산 개념이 없어 둘 다 직접 입력한다. */}
          <tr>
            <TableLabelCell>채취 시작시간</TableLabelCell>
            <TableInputCell type="time" colSpan={3} value={moisture.samplingStartTime}
              onChange={(v) => onChange({ samplingStartTime: v })} disabled={!editable} />
            <TableLabelCell>채취 종료시간</TableLabelCell>
            <TableInputCell type="time" colSpan={3} value={moisture.samplingEndTime}
              onChange={(v) => onChange({ samplingEndTime: v })} disabled={!editable} />
          </tr>
        </tbody>
      </table>
    </div>
  </SectionAccordion>
);
