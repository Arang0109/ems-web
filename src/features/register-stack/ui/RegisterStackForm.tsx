import { FieldGroup } from "@/components/ui/field"

import type { Workplace } from "@entities/workplace";

import { measurementFieldOptions, gradeOptions } from "../model/types";
import { useRegisterStack } from "../model/use-register-stack";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { InputGroup, Select, SectionTitle, HorizontalRadioGroup } from "@shared/ui/form";
import type { Grade, MeasurementField } from "@shared/model";
import { GRADE_LABEL } from "@shared/config";

import { Building2, Hash, Factory } from "lucide-react";

interface RegisterStackFormProps {
  workplace: Workplace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const RegisterStackForm = ({
  workplace,
  open,
  onOpenChange,
  onSuccess,
}: RegisterStackFormProps) => {

  const { form, handleChange, onSubmit } = useRegisterStack({
    workplace,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return(
    <FormDialog
      triggerLabel='측정시설 등록'
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      submitLabel='등록'
      disabled={!workplace}
    >
      <FieldGroup>
        <SectionTitle>사업장 정보</SectionTitle>
        <InputGroup
          label="측정대상 사업장"
          placeholder="측정대상 사업장"
          value={form.wokrplaceName ?? ''}
          helperText="사업자등록증상에 기재된 상호"
          startIcon={<Building2 />}
          disabled
          readOnly
        />

        <Divider />

        <SectionTitle>측정시설 정보</SectionTitle>
        <HorizontalRadioGroup
          options={measurementFieldOptions}
          value={form.field}
          onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="stackName"
            label="측정시설"
            placeholder="측정시설"
            value={form.stackName}
            onChange={(value) => handleChange("stackName", value)}
            startIcon={<Factory />}
          />
          <InputGroup
            id="semsNumber"
            label="SEMS 번호"
            placeholder="SEMS 번호"
            value={form.semsNumber}
            onChange={(value) => handleChange("semsNumber", value)}
            startIcon={<Hash />}
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            id="grade"
            label="시설 종별"
            placeholder="종별 선택"
            options={gradeOptions}
            value={GRADE_LABEL[form.grade]}
            onValueChange={(value) => value && handleChange("grade", value as Grade)}
          />
          <InputGroup
            id="businessCategory"
            label="업종"
            placeholder="업종"
            value={form.businessCategory}
            onChange={(value) => handleChange("businessCategory", value)}
          />
          <InputGroup
            id="mainProduct"
            label="주요 생산품"
            placeholder="주요 생산품"
            value={form.mainProduct}
            onChange={(value) => handleChange("mainProduct", value)}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
