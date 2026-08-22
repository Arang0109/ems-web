import type { EquipmentRegisterForm } from "../../model/types";

import { InputGroup, FieldGroup, Select } from "@shared/ui/form";
import { equipTypeOptions } from "@shared/model";
import type { EquipType } from "@shared/model";

import { STEP_GRID_3 } from "./step-props";

interface Props {
  form: EquipmentRegisterForm;
  fieldErrors?: Partial<Record<keyof EquipmentRegisterForm, string>>;
  onChange: (name: keyof EquipmentRegisterForm, value: string) => void;
  onTypeChange: (type: EquipType | '') => void;
}

export const BasicInfoStep = ({ form, fieldErrors, onChange, onTypeChange }: Props) => (
  <FieldGroup>
    <div className={STEP_GRID_3}>
      {/* Select 는 error prop 이 없어 문구를 직접 붙인다 —
          위저드에서는 '다음' 이 막히는 이유가 보여야 한다 */}
      <div className="space-y-1">
        <Select
          id="type"
          label="장비 종류"
          placeholder="장비 종류 선택"
          options={equipTypeOptions}
          value={form.type}
          onValueChange={(v) => onTypeChange(v ?? '')}
          required
        />
        {fieldErrors?.type && <p className="text-body-2 text-destructive">{fieldErrors.type}</p>}
      </div>
      <InputGroup
        id="equipmentName"
        label="장비명"
        placeholder="장비명"
        value={form.equipmentName}
        onChange={(v) => onChange('equipmentName', v)}
        invalid={!!fieldErrors?.equipmentName}
        error={fieldErrors?.equipmentName}
        required
      />
      <InputGroup id="managementNumber" label="관리번호" placeholder="관리번호"
        value={form.managementNumber} onChange={(v) => onChange('managementNumber', v)} />
    </div>
    <div className={STEP_GRID_3}>
      <InputGroup id="serialNumber" label="시리얼번호" placeholder="시리얼번호"
        value={form.serialNumber} onChange={(v) => onChange('serialNumber', v)} />
      <InputGroup id="modelName" label="모델명" placeholder="모델명"
        value={form.modelName} onChange={(v) => onChange('modelName', v)} />
      <InputGroup id="alias" label="별칭" placeholder="별칭"
        value={form.alias} onChange={(v) => onChange('alias', v)} />
    </div>
  </FieldGroup>
);
