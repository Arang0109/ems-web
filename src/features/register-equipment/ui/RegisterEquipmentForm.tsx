import { format } from "date-fns";

import { useRegisterEquipment } from "../model/hooks/use-register-equipment";
import { SpecFields } from "./SpecFields";
import { InspectionFields } from "./InspectionFields";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select, DatePicker, Textarea } from "@shared/ui/form";
import { equipTypeOptions } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: string;
  onSuccess?: () => void;
}

export const RegisterEquipmentForm = ({ open, onOpenChange, defaultType, onSuccess }: Props) => {
  const {
    form,
    fieldErrors,
    handleChange,
    handleTypeChange,
    handleSpecChange,
    handleAddCoefficient,
    handleRemoveCoefficient,
    handleCoefficientChange,
    handleAddDiameter,
    handleRemoveDiameter,
    handleDiameterChange,
    handleInspectionChange,
    handleSubmit,
  } = useRegisterEquipment({
    defaultType,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel="측정장비 등록"
      size="xl"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
    >
      <FieldGroup>
        <SectionTitle>기본 정보</SectionTitle>
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            id="type"
            label="장비 종류"
            placeholder="장비 종류 선택"
            options={equipTypeOptions}
            value={form.type}
            onValueChange={(v) => handleTypeChange(v ?? '')}
            required
          />
          <InputGroup
            id="equipmentName"
            label="장비명"
            placeholder="장비명"
            value={form.equipmentName}
            onChange={(v) => handleChange('equipmentName', v)}
            invalid={!!fieldErrors?.equipmentName}
            error={fieldErrors?.equipmentName}
            required
          />
          <InputGroup id="managementNumber" label="관리번호" placeholder="관리번호"
            value={form.managementNumber} onChange={(v) => handleChange('managementNumber', v)} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup id="serialNumber" label="시리얼번호" placeholder="시리얼번호"
            value={form.serialNumber} onChange={(v) => handleChange('serialNumber', v)} />
          <InputGroup id="modelName" label="모델명" placeholder="모델명"
            value={form.modelName} onChange={(v) => handleChange('modelName', v)} />
          <InputGroup id="alias" label="별칭" placeholder="별칭"
            value={form.alias} onChange={(v) => handleChange('alias', v)} />
        </div>

        <Divider />

        <SectionTitle>구매 정보</SectionTitle>
        <div className="grid md:grid-cols-4 gap-4">
          <InputGroup id="manufacturer" label="제조사" placeholder="제조사"
            value={form.manufacturer} onChange={(v) => handleChange('manufacturer', v)} />
          <InputGroup id="originCountry" label="원산지" placeholder="원산지"
            value={form.originCountry} onChange={(v) => handleChange('originCountry', v)} />
          <InputGroup id="price" label="가격" placeholder="가격"
            value={form.price} onChange={(v) => handleChange('price', v)} />
          <DatePicker
            id="purchaseDate"
            label="구매일"
            value={form.purchaseDate ? new Date(form.purchaseDate) : undefined}
            onChange={(date) => handleChange('purchaseDate', date ? format(date, 'yyyy-MM-dd') : '')}
          />
        </div>

        <Textarea id="remark" label="비고" placeholder="비고"
          value={form.remark} onChange={(v) => handleChange('remark', v)} rows={2} />

        <Divider />

        <InspectionFields
          inspections={form.inspections}
          error={fieldErrors?.inspections}
          onChange={handleInspectionChange}
        />

        <Divider />

        <SpecFields
          type={form.type}
          spec={form.spec}
          error={fieldErrors?.spec}
          onSpecChange={handleSpecChange}
          onAddCoefficient={handleAddCoefficient}
          onRemoveCoefficient={handleRemoveCoefficient}
          onCoefficientChange={handleCoefficientChange}
          onAddDiameter={handleAddDiameter}
          onRemoveDiameter={handleRemoveDiameter}
          onDiameterChange={handleDiameterChange}
        />
      </FieldGroup>
    </FormDialog>
  );
};
