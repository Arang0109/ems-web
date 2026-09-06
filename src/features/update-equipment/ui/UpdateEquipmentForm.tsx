import { format } from "date-fns";

import { useUpdateEquipment } from "../model/hooks/use-update-equipment";
import { useDeleteEquipment } from "../model/hooks/use-delete-equipment";
import { SpecFields } from "./SpecFields";
import { InspectionFields } from "./InspectionFields";

import type { Equipment } from "@entities/equipment";
import type { InspectionType } from "@shared/model";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, SectionTitle, FieldGroup, Select, DatePicker, Textarea } from "@shared/ui/form";
import { equipStatusOptions } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSuccess?: () => void;
  /** 검사 이력 다이얼로그 열기 — 같은 레이어 슬라이스를 직접 참조하지 않도록 위젯이 주입한다. */
  onOpenInspectionHistory?: (type: InspectionType) => void;
}

export const UpdateEquipmentForm = ({
  open, onOpenChange, equipment, onSuccess, onOpenInspectionHistory,
}: Props) => {
  const {
    form,
    fieldErrors,
    handleChange,
    handleSpecChange,
    handleAddCoefficient,
    handleRemoveCoefficient,
    handleCoefficientChange,
    handleAddDiameter,
    handleRemoveDiameter,
    handleDiameterChange,
    handleInspectionChange,
    handleSubmit,
  } = useUpdateEquipment({
    equipment,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteEquipment({
    equipment,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  if (!equipment) return;

  return (
    <FormDialog
      title="측정장비 상세"
      size="xl"
      // 입력 칸이 20개 가까이 되고 검사 항목 표까지 품는 폼이라 좁은 화면에서는 좌우 여백을 내준다.
      // (같은 장비를 등록하는 RegisterEquipmentForm 은 StepFormDialog 라 이미 기본값이 전체화면이다.)
      fullScreenOnMobile
      open={open}
      onOpenChange={onOpenChange}
      deleteLabel="삭제"
      cancelLabel="닫기"
      submitLabel="수정"
      onSubmit={handleSubmit}
      onDelete={handleDelete}
    >
      <FieldGroup>
        <SectionTitle>기본 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="type"
            label="장비 종류"
            value={equipment.type}
            onChange={() => {}}
            readOnly
            disabled
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
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup id="managementNumber" label="관리번호" placeholder="관리번호"
            value={form.managementNumber} onChange={(v) => handleChange('managementNumber', v)} />
          <InputGroup id="serialNumber" label="시리얼번호" placeholder="시리얼번호"
            value={form.serialNumber} onChange={(v) => handleChange('serialNumber', v)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup id="modelName" label="모델명" placeholder="모델명"
            value={form.modelName} onChange={(v) => handleChange('modelName', v)} />
          <InputGroup id="alias" label="별칭" placeholder="별칭"
            value={form.alias} onChange={(v) => handleChange('alias', v)} />
        </div>
        <Select
          id="status"
          label="상태"
          placeholder="상태 선택"
          options={equipStatusOptions}
          value={form.status}
          onValueChange={(v) => handleChange('status', v ?? '')}
        />

        <Divider />

        <SectionTitle>구매 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup id="manufacturer" label="제조사" placeholder="제조사"
            value={form.manufacturer} onChange={(v) => handleChange('manufacturer', v)} />
          <InputGroup id="originCountry" label="원산지" placeholder="원산지"
            value={form.originCountry} onChange={(v) => handleChange('originCountry', v)} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
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
          onOpenHistory={onOpenInspectionHistory}
        />

        <Divider />

        <SpecFields
          type={equipment.type}
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
