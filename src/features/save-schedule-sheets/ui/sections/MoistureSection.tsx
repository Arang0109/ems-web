import { Input, SectionTitle } from "@shared/ui/form";

import type { MoistureForm } from "../../model/types";

interface Props {
  moisture: MoistureForm;
  xw: number | null;
  editable: boolean;
  onChange: (patch: Partial<MoistureForm>) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

export const MoistureSection = ({ moisture, xw, editable, onChange }: Props) => (
  <section className="space-y-3">
    <SectionTitle>수분량</SectionTitle>
    <div className="grid md:grid-cols-4 gap-3">
      <Input label="흡습병 무게 전 (g)" type="number" value={moisture.weightBefore}
        onChange={(v) => onChange({ weightBefore: v })} disabled={!editable} />
      <Input label="흡습병 무게 후 (g)" type="number" value={moisture.weightAfter}
        onChange={(v) => onChange({ weightAfter: v })} disabled={!editable} />
      <Input label="가스미터 온도 입 (°C)" type="number" value={moisture.gasMeterTempIn}
        onChange={(v) => onChange({ gasMeterTempIn: v })} disabled={!editable} />
      <Input label="가스미터 온도 출 (°C)" type="number" value={moisture.gasMeterTempOut}
        onChange={(v) => onChange({ gasMeterTempOut: v })} disabled={!editable} />
      <Input label="건조가스량 전 (L)" type="number" value={moisture.dryGasVolumeBefore}
        onChange={(v) => onChange({ dryGasVolumeBefore: v })} disabled={!editable} />
      <Input label="건조가스량 후 (L)" type="number" value={moisture.dryGasVolumeAfter}
        onChange={(v) => onChange({ dryGasVolumeAfter: v })} disabled={!editable} />
      <Input label="흡인유속 (m/s)" type="number" value={moisture.suctionVelocity}
        onChange={(v) => onChange({ suctionVelocity: v })} disabled={!editable} />
      <Input label="가스미터 게이지압 (mmH₂O)" type="number" value={moisture.gasMeterGaugePressure}
        onChange={(v) => onChange({ gasMeterGaugePressure: v })} disabled={!editable} />
      <Input label="수분량 Xw (%, 계산)" value={display(xw)} readOnly disabled />
    </div>
  </section>
);
