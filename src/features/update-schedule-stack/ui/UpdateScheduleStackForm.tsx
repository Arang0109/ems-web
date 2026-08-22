import { Hash, Factory } from "lucide-react";

import type { StackSnapshot } from "@entities/schedule";
import {
  measurementFieldOptions, gradeOptions, orientationOptions, shapeOptions,
} from "@shared/model";
import type { Grade, MeasurementField, Orientation, Shape } from "@shared/model";
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, HorizontalRadioGroup, Select } from "@shared/ui/form";

import { useUpdateScheduleStack } from "../model/hooks/use-update-schedule-stack";

interface Props {
  scheduleId: number;
  stack: StackSnapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const UpdateScheduleStackForm = ({
  scheduleId, stack, open, onOpenChange, onSuccess,
}: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useUpdateScheduleStack({
    scheduleId,
    stack,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="측정시설 정보 수정"
      description="입력을 비워도 기존 값이 삭제되지 않고 그대로 유지됩니다."
      open={open}
      onOpenChange={onOpenChange}
      cancelLabel="취소"
      submitLabel="수정"
      isLoading={isLoading}
      size="lg"
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <SectionTitle>측정시설 정보</SectionTitle>
        <HorizontalRadioGroup
          options={measurementFieldOptions}
          value={form.field}
          onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="stackName"
            label="측정시설명"
            placeholder="측정시설명"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            invalid={!!fieldErrors?.name}
            error={fieldErrors?.name}
            startIcon={<Factory />}
          />
          <InputGroup
            id="stackSemsNumber"
            label="SEMS 번호"
            placeholder="SEMS 번호"
            value={form.semsNumber}
            onChange={(value) => handleChange("semsNumber", value)}
            invalid={!!fieldErrors?.semsNumber}
            error={fieldErrors?.semsNumber}
            startIcon={<Hash />}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="stackGrade"
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
            helperText="비워두면 기존 값이 유지됩니다"
          />
        </div>

        <Divider />

        <div className="grid md:grid-cols-5 gap-4">
          <Select
            id="orientation"
            label="방향"
            placeholder="방향 선택"
            options={orientationOptions}
            value={form.orientation}
            onValueChange={(value) => value && handleChange("orientation", value as Orientation)}
          />
          <InputGroup
            id="height"
            label="측정공 높이 (m)"
            placeholder="측정공 높이"
            value={form.height}
            onChange={(value) => handleChange("height", value)}
            invalid={!!fieldErrors?.height}
            error={fieldErrors?.height}
          />
          <Select
            id="shape"
            label="형태"
            placeholder="형태 선택"
            options={shapeOptions}
            value={form.shape}
            onValueChange={(value) => value && handleChange("shape", value as Shape)}
          />
          <InputGroup
            id="horizontalLength"
            label={form.shape === "CIRCULAR" ? "지름 (m)" : "가로 (m)"}
            placeholder={form.shape === "CIRCULAR" ? "지름" : "가로 길이"}
            value={form.horizontalLength}
            onChange={(value) => handleChange("horizontalLength", value)}
            invalid={!!fieldErrors?.horizontalLength}
            error={fieldErrors?.horizontalLength}
          />

          {form.shape === "RECTANGULAR" && (
            <InputGroup
              id="verticalLength"
              label="세로 (m)"
              placeholder="세로 길이"
              value={form.verticalLength}
              onChange={(value) => handleChange("verticalLength", value)}
              invalid={!!fieldErrors?.verticalLength}
              error={fieldErrors?.verticalLength}
            />
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <InputGroup
            id="standardOxygen"
            label="기준산소농도 (%)"
            placeholder="기준산소농도"
            value={form.standardOxygen}
            onChange={(value) => handleChange("standardOxygen", value)}
            invalid={!!fieldErrors?.standardOxygen}
            error={fieldErrors?.standardOxygen}
            helperText="비우면 미적용으로 저장됩니다"
          />
        </div>

        <p className="text-caption text-muted-foreground">
          기준산소농도·형태·치수를 변경하면 저장된 측정 데이터가 서버에서 재계산됩니다.
        </p>
      </FieldGroup>
    </FormDialog>
  );
};
