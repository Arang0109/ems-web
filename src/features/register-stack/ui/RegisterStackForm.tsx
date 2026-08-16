import type { Workplace } from "@entities/workplace";

import { measurementFieldOptions, gradeOptions } from "@shared/model";
import { useRegisterStack } from "../model/hooks/use-register-stack";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, Select, SectionTitle, HorizontalRadioGroup } from "@shared/ui/form";
import type { Grade, MeasurementField } from "@shared/model";

import { Building2, Hash, Factory, Plus } from "lucide-react";

interface Props {
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
}: Props) => {

  const { form, fieldErrors, handleChange, handleSubmit } = useRegisterStack({
    workplace,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return(
    <FormDialog
      triggerLabel={<><Plus /> 등록</>}
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='등록'
      disabled={!workplace}
    >
      <FieldGroup>
        <SectionTitle>사업장 정보</SectionTitle>
        <InputGroup
          label="측정대상 사업장"
          placeholder="측정대상 사업장"
          value={form.workplaceName ?? ''}
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
            invalid={!!fieldErrors?.stackName}
            error={fieldErrors?.stackName}
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
            value={form.grade}
            onValueChange={(value) => value && handleChange("grade", value as Grade)}
          />
          <InputGroup
            id="mainProduct"
            label="주요 생산품"
            placeholder="주요 생산품"
            value={form.mainProduct}
            onChange={(value) => handleChange("mainProduct", value)}
          />
          <InputGroup
            id="standardOxygen"
            label="기준산소농도 (%)"
            placeholder="예: 4"
            value={form.standardOxygen}
            onChange={(value) => handleChange("standardOxygen", value)}
            invalid={!!fieldErrors?.standardOxygen}
            error={fieldErrors?.standardOxygen}
            helperText="해당 없으면 비워두세요"
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
