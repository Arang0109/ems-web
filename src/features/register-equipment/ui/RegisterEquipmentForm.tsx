import { useRegisterEquipment } from "../model/hooks/use-register-equipment";
import { getEquipmentStepProgress, getVisibleEquipmentSteps } from "../model/step-progress";
import type { EquipmentStepId } from "../model/step-progress";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { PurchaseStep } from "./steps/PurchaseStep";
import { InspectionStep } from "./steps/InspectionStep";
import { SpecStep } from "./steps/SpecStep";

// UI
import { StepFormDialog } from "@shared/ui/dialogs";
import type { EquipType } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: EquipType | '';
  onSuccess?: () => void;
}

export const RegisterEquipmentForm = ({ open, onOpenChange, defaultType, onSuccess }: Props) => {
  const {
    form,
    isDirty,
    isLoading,
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
    validateStep,
    handleSubmit,
  } = useRegisterEquipment({
    defaultType,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  // 스텝 본문. 가스분석기처럼 사양이 없는 종류는 아래 getVisibleEquipmentSteps 가 걸러낸다.
  const content: Record<EquipmentStepId, React.ReactNode> = {
    basic: (
      <BasicInfoStep
        form={form}
        fieldErrors={fieldErrors}
        onChange={handleChange}
        onTypeChange={handleTypeChange}
      />
    ),
    purchase: <PurchaseStep form={form} onChange={handleChange} />,
    inspection: (
      <InspectionStep
        inspections={form.inspections}
        error={fieldErrors?.inspections}
        onChange={handleInspectionChange}
      />
    ),
    spec: (
      <SpecStep
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
    ),
  };

  return (
    <StepFormDialog
      triggerLabel="측정장비 등록"
      title="측정장비 등록"
      size="xl"
      open={open}
      onOpenChange={onOpenChange}
      isDirty={isDirty}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitLabel="등록"
      loadingLabel="등록 중..."
      steps={getVisibleEquipmentSteps(form.type).map((step) => ({
        id: step.id,
        label: step.label,
        content: content[step.id],
        progress: getEquipmentStepProgress(form, step.id),
        validate: () => validateStep(step.id),
      }))}
    />
  );
};
