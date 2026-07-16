import { Input, SectionTitle } from "@shared/ui/form";

import type { ParticleSampleForm } from "../../model/types";

interface Props {
  particle: ParticleSampleForm;
  cp: number | null;
  editable: boolean;
  onChange: (patch: Partial<ParticleSampleForm>) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

export const ParticleSection = ({ particle, cp, editable, onChange }: Props) => (
  <section className="space-y-3">
    <SectionTitle>입자상 시료</SectionTitle>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Input label="노즐 사이즈 (cm)" type="number" value={particle.nozzleSize}
        onChange={(v) => onChange({ nozzleSize: v })} disabled={!editable} />
      <Input label="흡입량 Vm" type="number" value={particle.Vm}
        onChange={(v) => onChange({ Vm: v })} disabled={!editable} />
      <Input label="채취시간 (min)" type="number" value={particle.samplingTime}
        onChange={(v) => onChange({ samplingTime: v })} disabled={!editable} />
      <Input label="측정 시작시간" type="time" value={particle.measureStartTime}
        onChange={(v) => onChange({ measureStartTime: v })} disabled={!editable} />
      <Input label="측정 종료시간" type="time" value={particle.measureEndTime}
        onChange={(v) => onChange({ measureEndTime: v })} disabled={!editable} />
      <Input label="채취 시작시간" type="time" value={particle.samplingStartTime}
        onChange={(v) => onChange({ samplingStartTime: v })} disabled={!editable} />
      <Input label="채취 종료시간" type="time" value={particle.samplingEndTime}
        onChange={(v) => onChange({ samplingEndTime: v })} disabled={!editable} />
      <Input label="측정여지번호" value={particle.thimbleFilter}
        onChange={(v) => onChange({ thimbleFilter: v })} disabled={!editable} />
      <Input label="바탕여지번호" value={particle.bgThimbleFilter}
        onChange={(v) => onChange({ bgThimbleFilter: v })} disabled={!editable} />
      <Input label="피토관계수 Cp (계산)" value={display(cp)} readOnly disabled />
    </div>
  </section>
);
