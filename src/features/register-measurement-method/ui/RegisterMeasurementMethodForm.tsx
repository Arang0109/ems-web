import { useRegisterMeasurementMethod } from "../model/hooks/use-register-measurement-method";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import { sampleGroupingOptions } from "@shared/model";
import type { SampleGrouping } from "@shared/model";

// Icon
import { Clock, FlaskConical, Plus, Tag } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/**
 * 측정방법 등록.
 *
 * 측정방법은 "이 항목들을 어떻게 잡는가"다. 채취 단위가 `MERGED` 면 그 방법의 항목 전부를 한 병에 담아
 * 기록지에 통칭명 한 행으로 적고, `PER_ITEM` 이면 항목마다 한 행, `NONE` 이면 가스상 시료 행이 없다.
 * 표준 채취시간은 이 방법을 쓰는 모든 측정항목에 한 번에 적용된다 — 항목마다 적지 않는다.
 */
export const RegisterMeasurementMethodForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useRegisterMeasurementMethod({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const isMerged = form.sampleGrouping === "MERGED";

  return (
    <FormDialog
      triggerLabel={<><Plus />측정방법 등록</>}
      title="측정방법 등록"
      description="측정물질을 채택할 때 고를 측정방법(채취 매체·방식)을 만듭니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>측정방법</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="이름"
            placeholder="예: 카트리지"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            invalid={!!fieldErrors?.name}
            error={fieldErrors?.name}
            required
            startIcon={<FlaskConical />}
          />
          <Select
            id="sampleGrouping"
            label="채취 단위"
            placeholder="채취 단위 선택"
            options={sampleGroupingOptions}
            value={form.sampleGrouping}
            onValueChange={(value) => value && handleChange("sampleGrouping", value as SampleGrouping)}
            errorMessage={fieldErrors?.sampleGrouping}
            helperText="한 병으로 함께 채취하면 '통칭 채취', 물질마다 병이 갈리면 '항목별 채취'. 입자상 시트에서 잡거나 직독식이면 '가스상 표 없음'입니다."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* 통칭명은 MERGED 에서만 뜻이 있다 — 다른 단위에서는 입력 자체를 닫아 서버 400 을 피한다. */}
          <InputGroup
            id="mergedSampleName"
            label="기록지 통칭명"
            placeholder={isMerged ? "예: VOCs" : "통칭 채취일 때만 입력"}
            value={form.mergedSampleName}
            onChange={(value) => handleChange("mergedSampleName", value)}
            disabled={!isMerged}
            invalid={!!fieldErrors?.mergedSampleName}
            error={fieldErrors?.mergedSampleName}
            required={isMerged}
            startIcon={<Tag />}
          />
          <InputGroup
            id="samplingMinutes"
            type="number"
            label="표준 채취시간 (분)"
            placeholder="예: 30"
            value={form.samplingMinutes}
            onChange={(value) => handleChange("samplingMinutes", value)}
            min={0}
            maxDecimals={0}
            invalid={!!fieldErrors?.samplingMinutes}
            error={fieldErrors?.samplingMinutes}
            helperText="이 방법을 쓰는 모든 측정항목에 적용됩니다."
            startIcon={<Clock />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
