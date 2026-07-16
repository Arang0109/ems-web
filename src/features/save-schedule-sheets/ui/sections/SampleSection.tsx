import { Plus, Trash2 } from "lucide-react";

import { Input, SectionTitle } from "@shared/ui/form";
import { Button } from "@shared/ui/buttons";

import type { SampleForm } from "../../model/types";

interface Props {
  samples: SampleForm[];
  editable: boolean;
  onSampleChange: (index: number, patch: Partial<SampleForm>) => void;
  onAddSample: () => void;
  onRemoveSample: (index: number) => void;
}

export const SampleSection = ({ samples, editable, onSampleChange, onAddSample, onRemoveSample }: Props) => (
  <section className="space-y-3">
    <div className="flex items-center justify-between">
      <SectionTitle>시료 채취</SectionTitle>
      <Button type="button" variant="outline" size="sm" onClick={onAddSample} disabled={!editable}>
        <Plus size={14} className="mr-1" />시료 추가
      </Button>
    </div>

    {samples.length === 0 ? (
      <p className="text-sm text-muted-foreground py-2">등록된 시료가 없습니다.</p>
    ) : (
      <div className="space-y-3">
        {samples.map((sample, index) => (
          <div key={index} className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">시료 #{index + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveSample(index)} disabled={!editable}>
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Input label="시료명" value={sample.sampleName}
                onChange={(v) => onSampleChange(index, { sampleName: v })} disabled={!editable} />
              <Input label="시료번호" value={sample.sampleNumber}
                onChange={(v) => onSampleChange(index, { sampleNumber: v })} disabled={!editable} />
              <Input label="시작시간" type="time" value={sample.startTime}
                onChange={(v) => onSampleChange(index, { startTime: v })} disabled={!editable} />
              <Input label="종료시간" type="time" value={sample.endTime}
                onChange={(v) => onSampleChange(index, { endTime: v })} disabled={!editable} />
              <Input label="흡인량" type="number" value={sample.suctionQuantity}
                onChange={(v) => onSampleChange(index, { suctionQuantity: v })} disabled={!editable} />
              <Input label="게이지압" type="number" value={sample.gasMeterGaugePressure}
                onChange={(v) => onSampleChange(index, { gasMeterGaugePressure: v })} disabled={!editable} />
              <Input label="입구온도 (°C)" type="number" value={sample.inTemperature}
                onChange={(v) => onSampleChange(index, { inTemperature: v })} disabled={!editable} />
              <Input label="출구온도 (°C)" type="number" value={sample.outTemperature}
                onChange={(v) => onSampleChange(index, { outTemperature: v })} disabled={!editable} />
              <Input label="채취 전 부피" type="number" value={sample.beforeVolume}
                onChange={(v) => onSampleChange(index, { beforeVolume: v })} disabled={!editable} />
              <Input label="채취 후 부피" type="number" value={sample.afterVolume}
                onChange={(v) => onSampleChange(index, { afterVolume: v })} disabled={!editable} />
              <Input label="바탕시료번호" value={sample.blankSampleNumber}
                onChange={(v) => onSampleChange(index, { blankSampleNumber: v })} disabled={!editable} />
              <Input label="채취량" type="number" value={sample.samplingVolume}
                onChange={(v) => onSampleChange(index, { samplingVolume: v })} disabled={!editable} />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);
