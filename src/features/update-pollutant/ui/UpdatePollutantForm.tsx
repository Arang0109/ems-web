import { Hash, FlaskConical, FileText } from "lucide-react";

import { useUpdatePollutant } from "../model/hooks/use-update-pollutant";
import { useDeletePollutant } from "../model/hooks/use-delete-pollutant";

import type { Pollutant } from "@entities/pollutant";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import {
  measurementFieldOptions, measurementMethodOptions, pollutantPhaseOptions,
} from "@shared/model";
import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollutant: Pollutant | null;
  onSuccess?: () => void;
}

export const UpdatePollutantForm = ({ open, onOpenChange, pollutant, onSuccess }: Props) => {
  const close = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const { form, fieldErrors, isLoading: isUpdating, handleChange, handleSubmit } =
    useUpdatePollutant({ pollutant, onSuccess: close });

  const { isLoading: isDeleting, handleDelete } =
    useDeletePollutant({ pollutant, onSuccess: close });

  if (!pollutant) return;

  return (
    <FormDialog
      title="측정물질 상세"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      submitLabel="수정"
      deleteLabel="삭제"
      cancelLabel="닫기"
      isLoading={isUpdating || isDeleting}
    >
      <FieldGroup>
        <SectionTitle>측정물질 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="nameKr"
            label="측정물질(한글)"
            placeholder="측정물질(한글)"
            value={form.nameKr}
            onChange={(value) => handleChange("nameKr", value)}
            invalid={!!fieldErrors?.nameKr}
            error={fieldErrors?.nameKr}
            required
            startIcon={<Hash />}
          />
          <InputGroup
            id="nameEn"
            label="측정물질(영문)"
            placeholder="측정물질(영문)"
            value={form.nameEn}
            onChange={(value) => handleChange("nameEn", value)}
            startIcon={<Hash />}
          />
        </div>
        <Select
          id="field"
          label="측정분야"
          placeholder="측정분야 선택"
          options={measurementFieldOptions}
          value={form.field}
          onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
          required
        />
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="method"
            label="측정방법"
            placeholder="측정방법 선택"
            options={measurementMethodOptions}
            value={form.method}
            onValueChange={(value) => value && handleChange("method", value as MeasurementMethod)}
          />
          <Select
            id="phase"
            label="상"
            placeholder="상 선택"
            options={pollutantPhaseOptions}
            value={form.phase}
            onValueChange={(value) => value && handleChange("phase", value as PollutantPhase)}
          />
        </div>

        <Divider />

        <SectionTitle>분석 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="equipment"
            label="분석장비"
            placeholder="분석장비"
            value={form.equipment}
            onChange={(value) => handleChange("equipment", value)}
            startIcon={<FlaskConical />}
          />
          <InputGroup
            id="testMethod"
            label="공정시험법"
            placeholder="공정시험법"
            value={form.testMethod}
            onChange={(value) => handleChange("testMethod", value)}
            startIcon={<FileText />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
