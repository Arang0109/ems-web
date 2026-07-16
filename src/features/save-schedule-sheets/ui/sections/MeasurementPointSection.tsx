import { Plus, Trash2 } from "lucide-react";

import { Input, SectionTitle } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";

import type { MeasurementPointForm } from "../../model/types";

interface Props {
  points: MeasurementPointForm[];
  avgTg: number | null;
  avgPv: number | null;
  avgPs: number | null;
  editable: boolean;
  onPointChange: (index: number, patch: Partial<MeasurementPointForm>) => void;
  onAddPoint: () => void;
  onRemovePoint: (index: number) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

export const MeasurementPointSection = ({
  points, avgTg, avgPv, avgPs, editable, onPointChange, onAddPoint, onRemovePoint,
}: Props) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <SectionTitle>측정점</SectionTitle>
      <Button type="button" variant="outline" size="sm" onClick={onAddPoint} disabled={!editable}>
        <Plus size={14} className="mr-1" />측정점 추가
      </Button>
    </div>

    {points.length === 0 ? (
      <p className="text-sm text-muted-foreground py-2">측정점을 추가해주세요.</p>
    ) : (
      <div className="space-y-3">
        {points.map((point, index) => (
          <div key={index} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">측정점 #{index + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemovePoint(index)} disabled={!editable}>
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Input label="배출가스온도 Ts (°C)" type="number" value={point.Ts}
                onChange={(v) => onPointChange(index, { Ts: v })} disabled={!editable} />
              <Input label="동압 Pv (mmH₂O)" type="number" value={point.Pv}
                onChange={(v) => onPointChange(index, { Pv: v })} disabled={!editable} />
              <Input label="정압 Ps (mmH₂O)" type="number" value={point.Ps}
                onChange={(v) => onPointChange(index, { Ps: v })} disabled={!editable} />
              <Input label="DGM 입구온도 (°C)" type="number" value={point.inTm}
                onChange={(v) => onPointChange(index, { inTm: v })} disabled={!editable} />
              <Input label="DGM 출구온도 (°C)" type="number" value={point.outTm}
                onChange={(v) => onPointChange(index, { outTm: v })} disabled={!editable} />
              <Input label="흡입량 전 Vm" type="number" value={point.beforeVm}
                onChange={(v) => onPointChange(index, { beforeVm: v })} disabled={!editable} />
              <Input label="흡입량 후 Vm" type="number" value={point.afterVm}
                onChange={(v) => onPointChange(index, { afterVm: v })} disabled={!editable} />
              <Input label="채취시간 (min)" type="number" value={point.samplingTime}
                onChange={(v) => onPointChange(index, { samplingTime: v })} disabled={!editable} />
              <Input label="진공게이지압 (mmHg)" type="number" value={point.vacuumGaugePressure}
                onChange={(v) => onPointChange(index, { vacuumGaugePressure: v })} disabled={!editable} />
              <Input label="최종임핀저온도 (°C)" type="number" value={point.finalImpingerTemperature}
                onChange={(v) => onPointChange(index, { finalImpingerTemperature: v })} disabled={!editable} />
            </div>
          </div>
        ))}
      </div>
    )}

    <div className="grid md:grid-cols-3 gap-3">
      <Input label="평균 배출가스온도 avgTg (K, 계산)" value={display(avgTg)} readOnly disabled />
      <Input label="평균 동압 avgPv (계산)" value={display(avgPv)} readOnly disabled />
      <Input label="평균 정압 avgPs (계산)" value={display(avgPs)} readOnly disabled />
    </div>
  </section>
);
