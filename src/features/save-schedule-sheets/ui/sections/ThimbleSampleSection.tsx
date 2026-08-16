import { Plus, Trash2 } from "lucide-react";

import { SectionAccordion, SubAccordion } from "@shared/ui/accordion";
import { Button, IconButton } from "@shared/ui/buttons";
import { UnitField } from "@shared/ui/form";

import { THIMBLE_HINT } from "../../model/field-hints";
import type { ParticleForm, SampleForm } from "../../model/types";
import { FIELD_GRID, type SectionShellProps } from "./shell-props";

interface Props extends SectionShellProps {
  particle: ParticleForm;
  samples: SampleForm[];
  editable: boolean;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
  onSampleChange: (index: number, patch: Partial<SampleForm>) => void;
  onAddSample: () => void;
  onRemoveSample: (index: number) => void;
}

// 원통여지 번호와 채취 시료를 하나의 섹션으로 묶는다(피그마 섹션 바로가기의 "여지·시료").
// 입자상 시트에서만 노출된다.
export const ThimbleSampleSection = ({
  particle, samples, editable,
  onParticleChange, onSampleChange, onAddSample, onRemoveSample,
  ...shell
}: Props) => (
  <SectionAccordion
    {...shell}
    title="여지·시료"
    description="원통여지 번호와 채취한 시료 정보를 입력합니다."
  >
    <div className={FIELD_GRID}>
      <UnitField
        label="측정여지번호" required
        hint={THIMBLE_HINT.thimbleFilter}
        value={particle.thimbleFilter} disabled={!editable}
        onChange={(v) => onParticleChange({ thimbleFilter: v })}
      />
      <UnitField
        label="바탕여지번호" required
        hint={THIMBLE_HINT.bgThimbleFilter}
        value={particle.bgThimbleFilter} disabled={!editable}
        onChange={(v) => onParticleChange({ bgThimbleFilter: v })}
      />
    </div>

    <div className="flex items-center justify-between gap-2">
      <span className="text-body-4 text-ink">시료 채취</span>
      <Button type="button" variant="outline" size="sm" onClick={onAddSample} disabled={!editable}>
        <Plus size={14} />시료 추가
      </Button>
    </div>

    {samples.length === 0 ? (
      <p className="text-body-3 text-muted-ink">등록된 시료가 없습니다.</p>
    ) : (
      <div className="space-y-3">
        {samples.map((sample, index) => (
          <SubAccordion
            key={index}
            title={sample.sampleName.trim() || `시료 #${index + 1}`}
            defaultOpen={index === 0}
            action={
              editable ? (
                <IconButton
                  variant="ghost" size="icon-sm" label={`시료 #${index + 1} 삭제`}
                  icon={<Trash2 size={16} />}
                  onClick={() => onRemoveSample(index)}
                />
              ) : undefined
            }
          >
            <div className={FIELD_GRID}>
              <UnitField label="시료명" required value={sample.sampleName} disabled={!editable}
                onChange={(v) => onSampleChange(index, { sampleName: v })} />
              <UnitField label="시료번호" required value={sample.sampleNumber} disabled={!editable}
                onChange={(v) => onSampleChange(index, { sampleNumber: v })} />
              <UnitField label="바탕시료번호" value={sample.blankSampleNumber} disabled={!editable}
                onChange={(v) => onSampleChange(index, { blankSampleNumber: v })} />
              <UnitField label="시작시간" required type="time" value={sample.startTime} disabled={!editable}
                onChange={(v) => onSampleChange(index, { startTime: v })} />
              <UnitField label="종료시간" required type="time" value={sample.endTime} disabled={!editable}
                onChange={(v) => onSampleChange(index, { endTime: v })} />
              <UnitField label="흡인량" required unit="L" type="number" value={sample.suctionQuantity} disabled={!editable}
                onChange={(v) => onSampleChange(index, { suctionQuantity: v })} />
              <UnitField label="게이지압" required unit="mmH₂O" type="number" value={sample.gasMeterGaugePressure} disabled={!editable}
                onChange={(v) => onSampleChange(index, { gasMeterGaugePressure: v })} />
              <UnitField label="입구온도" required unit="°C" type="number" value={sample.inTemperature} disabled={!editable}
                onChange={(v) => onSampleChange(index, { inTemperature: v })} />
              <UnitField label="출구온도" required unit="°C" type="number" value={sample.outTemperature} disabled={!editable}
                onChange={(v) => onSampleChange(index, { outTemperature: v })} />
              <UnitField label="채취 전 부피" required unit="L" type="number" value={sample.beforeVolume} disabled={!editable}
                onChange={(v) => onSampleChange(index, { beforeVolume: v })} />
              <UnitField label="채취 후 부피" required unit="L" type="number" value={sample.afterVolume} disabled={!editable}
                onChange={(v) => onSampleChange(index, { afterVolume: v })} />
              <UnitField label="채취량" required unit="L" type="number" value={sample.samplingVolume} disabled={!editable}
                onChange={(v) => onSampleChange(index, { samplingVolume: v })} />
            </div>
          </SubAccordion>
        ))}
      </div>
    )}
  </SectionAccordion>
);
