import { useRegisterPollutant } from "../model/hooks/use-register-pollutant";
import { measurementFieldOptions, measurementMethodOptions, pollutantPhaseOptions } from "@shared/model";

// UI

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";

// Icon
import { User2Icon, Hash, Plus } from "lucide-react";
import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL } from "@shared/config";
import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterPollutantForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, handleChange, handleSubmit } = useRegisterPollutant({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return(
    <FormDialog
      triggerLabel={<><Plus /> 측정물질 등록</>}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='등록'
    >
      <FieldGroup>
        {/* 기관 정보 */}
        <SectionTitle>기관 정보</SectionTitle>
        <Select
          id="field"
          label="측정분야"
          placeholder="측정분야 선택"
          options={measurementFieldOptions}
          value={MEASUREMENT_FIELD_LABEL[form.field]}
          onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
        />
        <Select
          id="field"
          label="측정방법"
          placeholder="측정방법 선택"
          options={measurementMethodOptions}
          value={MEASUREMENT_METHOD_LABEL[form.method]}
          onValueChange={(value) => value && handleChange("method", value as MeasurementMethod)}
        />
        <Select
          id="field"
          label="상"
          placeholder="상 선택"
          options={pollutantPhaseOptions}
          value={POLLUTANT_PHASE_LABEL[form.phase]}
          onValueChange={(value) => value && handleChange("phase", value as PollutantPhase)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="nameKr"
            label="측정물질(한글)"
            placeholder="측정물질(한글)"
            value={form.nameKr}
            onChange={(value) => handleChange("nameKr", value)}
            startIcon={<Hash />}
          />
          <InputGroup
            id="nameKr"
            label="측정물질(영문)"
            placeholder="측정물질(영)"
            value={form.nameEn}
            onChange={(value) => handleChange("nameEn", value)}
            startIcon={<Hash />}
          />
        </div>

        <Divider />

        {/* 담당자 정보 */}
        <SectionTitle>분석 정보</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="equipment"
            placeholder="분석장비"
            value={form.equipment}
            onChange={(value) => handleChange("equipment", value)}
            startIcon={<User2Icon />}
          />
          <InputGroup
            id="testMethod"
            placeholder="공정시험법"
            value={form.testMethod}
            onChange={(value) => handleChange("testMethod", value)}
            startIcon={<User2Icon />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
}