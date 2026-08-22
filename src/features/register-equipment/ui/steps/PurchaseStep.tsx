import { format } from "date-fns";

import type { EquipmentRegisterForm } from "../../model/types";

import { InputGroup, FieldGroup, DatePicker, Textarea } from "@shared/ui/form";

import { STEP_GRID_4 } from "./step-props";

interface Props {
  form: EquipmentRegisterForm;
  onChange: (name: keyof EquipmentRegisterForm, value: string) => void;
}

export const PurchaseStep = ({ form, onChange }: Props) => (
  <FieldGroup>
    <div className={STEP_GRID_4}>
      <InputGroup id="manufacturer" label="제조사" placeholder="제조사"
        value={form.manufacturer} onChange={(v) => onChange('manufacturer', v)} />
      <InputGroup id="originCountry" label="원산지" placeholder="원산지"
        value={form.originCountry} onChange={(v) => onChange('originCountry', v)} />
      <InputGroup id="price" label="가격" placeholder="가격"
        value={form.price} onChange={(v) => onChange('price', v)} />
      <DatePicker
        id="purchaseDate"
        label="구매일"
        value={form.purchaseDate ? new Date(form.purchaseDate) : undefined}
        onChange={(date) => onChange('purchaseDate', date ? format(date, 'yyyy-MM-dd') : '')}
      />
    </div>

    <Textarea id="remark" label="비고" placeholder="비고"
      value={form.remark} onChange={(v) => onChange('remark', v)} rows={2} />
  </FieldGroup>
);
