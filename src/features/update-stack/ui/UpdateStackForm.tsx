import { useUpdateStack } from '../model/hooks/use-update-stack';

import { GRADE_LABEL, ORIENTATION_LABEL, SHAPE_LABEL } from '@shared/config';
import { measurementFieldOptions, gradeOptions, orientationOptions, shapeOptions } from "@shared/model";
import type { Grade, MeasurementField, Orientation, Shape } from "@shared/model";
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from '@shared/ui/borders';
import { FieldGroup, InputGroup, SectionTitle, HorizontalRadioGroup, Select } from "@shared/ui/form";

import { Hash, Factory } from "lucide-react";
import type { Stack } from '@entities/stack';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stack: Stack | null;
  onSuccess?: () => void;
}

export const UpdateStackForm = ({ open, onOpenChange, stack, onSuccess }: Props) => {
  const { form, handleSubmit, handleChange } = useUpdateStack({
    stack: stack,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return(
    <FormDialog
      title='측정시설 상세'
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel='닫기'
      submitLabel='수정'
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        {/* 기관 정보 */}
        <SectionTitle>측정시설 정보</SectionTitle>
        <HorizontalRadioGroup
          options={measurementFieldOptions}
          value={form.field}
          onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
        />
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="측정시설"
            placeholder="측정시설"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
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

        <Divider />
        
        <div className="grid md:grid-cols-5 gap-4">
          <Select
            id="orientation"
            label="방향"
            placeholder="방향 선택"
            options={orientationOptions}
            value={ORIENTATION_LABEL[form.orientation]}
            onValueChange={(value) => value && handleChange("orientation", value as Orientation)}
          />
          <InputGroup
            id="height"
            label="높이"
            placeholder="시설 높이"
            value={form.height}
            onChange={(value) => handleChange("height", value)}
          />
          <Select
            id="shape"
            label="모양"
            placeholder="모양 선택"
            options={shapeOptions}
            value={SHAPE_LABEL[form.shape]}
            onValueChange={(value) => value && handleChange("shape", value as Shape)}
          />
          <InputGroup
            id="horizontalLength"
            label={form.shape === "CIRCULAR" ? "직경" : "가로"}
            placeholder={form.shape === "CIRCULAR" ? "직경" : "가로 길이"}
            value={form.horizontalLength}
            onChange={(value) => handleChange("horizontalLength", value)}
          />

          {form.shape === "RECTANGULAR" && (
            <InputGroup
              id="verticalLength"
              label="세로"
              placeholder="세로 길이"
              value={form.verticalLength}
              onChange={(value) => handleChange("verticalLength", value)}
            />
          )}
        </div>
      </FieldGroup>
    </FormDialog>
  );
}
