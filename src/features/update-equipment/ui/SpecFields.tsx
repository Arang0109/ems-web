import { Plus, Trash2 } from "lucide-react";

import type { EquipmentSpecForm } from "../model/types";

import { InputGroup, Select, SectionTitle } from "@shared/ui/form";
import { pitotTubeTypeOptions } from "@shared/model";
import { EQUIP_SPEC_FIELD_LABEL } from "@shared/config";

type SpecScalarField = 'totalVolume' | 'orificeDp' | 'yd' | 'pitotTubeType';

interface Props {
  type: string;
  spec: EquipmentSpecForm;
  error?: string;
  onSpecChange: (name: SpecScalarField, value: string) => void;
  onAddCoefficient: () => void;
  onRemoveCoefficient: (index: number) => void;
  onCoefficientChange: (index: number, field: 'coefficient' | 'velocity', value: string) => void;
  onAddDiameter: () => void;
  onRemoveDiameter: (index: number) => void;
  onDiameterChange: (index: number, value: string) => void;
}

const AddRowButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1 text-body-2 text-brand-dark hover:underline"
  >
    <Plus className="size-4" /> {label}
  </button>
);

const RemoveRowButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center text-muted-foreground hover:text-destructive"
    aria-label="행 삭제"
  >
    <Trash2 className="size-4" />
  </button>
);

export const SpecFields = ({
  type,
  spec,
  error,
  onSpecChange,
  onAddCoefficient,
  onRemoveCoefficient,
  onCoefficientChange,
  onAddDiameter,
  onRemoveDiameter,
  onDiameterChange,
}: Props) => {
  if (!type) return null;

  return (
    <div className="space-y-4">
      <SectionTitle>사양</SectionTitle>

      {type === 'GAS_ANALYZER' && (
        <p className="text-body-2 text-muted-foreground">가스분석기는 별도 사양 항목이 없습니다.</p>
      )}

      {type === 'PARTICLE_SAMPLER' && (
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup id="totalVolume" label={EQUIP_SPEC_FIELD_LABEL.totalVolume} placeholder={EQUIP_SPEC_FIELD_LABEL.totalVolume} value={spec.totalVolume}
            onChange={(v) => onSpecChange('totalVolume', v)} />
          <InputGroup id="orificeDp" label={EQUIP_SPEC_FIELD_LABEL.orificeDp} placeholder={EQUIP_SPEC_FIELD_LABEL.orificeDp} value={spec.orificeDp}
            onChange={(v) => onSpecChange('orificeDp', v)} />
          <InputGroup id="yd" label={EQUIP_SPEC_FIELD_LABEL.yd} placeholder={EQUIP_SPEC_FIELD_LABEL.yd} value={spec.yd}
            onChange={(v) => onSpecChange('yd', v)} />
        </div>
      )}

      {(type === 'GAS_SAMPLER' || type === 'OTHER') && (
        <InputGroup id="totalVolume" label={EQUIP_SPEC_FIELD_LABEL.totalVolume} placeholder={EQUIP_SPEC_FIELD_LABEL.totalVolume} value={spec.totalVolume}
          onChange={(v) => onSpecChange('totalVolume', v)} />
      )}

      {type === 'PITOT_TUBE' && (
        <div className="space-y-4">
          <Select
            id="pitotTubeType"
            label={EQUIP_SPEC_FIELD_LABEL.pitotTubeType}
            placeholder={`${EQUIP_SPEC_FIELD_LABEL.pitotTubeType} 선택`}
            options={pitotTubeTypeOptions}
            value={spec.pitotTubeType}
            onValueChange={(v) => onSpecChange('pitotTubeType', v ?? '')}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-body-4 text-foreground">{EQUIP_SPEC_FIELD_LABEL.coefficients}</span>
              <AddRowButton label={`${EQUIP_SPEC_FIELD_LABEL.coefficient} 추가`} onClick={onAddCoefficient} />
            </div>
            {spec.coefficients.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                <InputGroup id={`coefficient-${i}`} placeholder={EQUIP_SPEC_FIELD_LABEL.coefficient} value={c.coefficient}
                  onChange={(v) => onCoefficientChange(i, 'coefficient', v)} />
                <InputGroup id={`velocity-${i}`} placeholder={EQUIP_SPEC_FIELD_LABEL.velocity} value={c.velocity}
                  onChange={(v) => onCoefficientChange(i, 'velocity', v)} />
                <RemoveRowButton onClick={() => onRemoveCoefficient(i)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'NOZZLE' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-body-4 text-foreground">{EQUIP_SPEC_FIELD_LABEL.diameters}</span>
            <AddRowButton label={`${EQUIP_SPEC_FIELD_LABEL.diameter} 추가`} onClick={onAddDiameter} />
          </div>
          {spec.diameters.map((d, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-2">
              <InputGroup id={`diameter-${i}`} placeholder={EQUIP_SPEC_FIELD_LABEL.diameter} value={d.diameter}
                onChange={(v) => onDiameterChange(i, v)} />
              <RemoveRowButton onClick={() => onRemoveDiameter(i)} />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-body-2 text-destructive">{error}</p>}
    </div>
  );
};
