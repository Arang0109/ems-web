import { Clock, FlaskConical, Gauge, Tag } from "lucide-react";

import { useUpdateMeasurementMethod } from "../model/hooks/use-update-measurement-method";
import { useDeleteMeasurementMethod } from "../model/hooks/use-delete-measurement-method";

import type { MeasurementMethod } from "@entities/measurement-method";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import { sampleGroupingOptions } from "@shared/model";
import type { SampleGrouping } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: MeasurementMethod | null;
  onSuccess?: () => void;
}

/**
 * 측정방법 상세 편집.
 *
 * 채취시간·통칭명은 여기서 한 번 고치면 이 방법을 쓰는 측정항목 전부에 즉시 반영된다 —
 * 항목마다 따로 적지 않는 것이 측정방법을 둔 이유다. 이미 만들어진 측정계획은 사본이라 바뀌지 않는다.
 */
export const UpdateMeasurementMethodForm = ({ open, onOpenChange, method, onSuccess }: Props) => {
  const close = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const { form, fieldErrors, isLoading: isUpdating, handleChange, handleSubmit } =
    useUpdateMeasurementMethod({ method, onSuccess: close });

  const { isLoading: isDeleting, handleDelete } =
    useDeleteMeasurementMethod({ method, onSuccess: close });

  if (!method) return;

  const isMerged = form.sampleGrouping === "MERGED";

  return (
    <FormDialog
      title="측정방법 상세"
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
        <SectionTitle>측정방법</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="name"
            label="이름"
            placeholder="예: 카트리지"
            value={form.name}
            onChange={(value) => handleChange("name", value)}
            errorMessage={fieldErrors?.name}
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
          <InputGroup
            id="mergedSampleName"
            label="기록지 통칭명"
            placeholder={isMerged ? "예: VOCs" : "통칭 채취일 때만 입력"}
            value={form.mergedSampleName}
            onChange={(value) => handleChange("mergedSampleName", value)}
            disabled={!isMerged}
            errorMessage={fieldErrors?.mergedSampleName}
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
            errorMessage={fieldErrors?.samplingMinutes}
            helperText="비우면 미지정으로 저장됩니다. 이 방법을 쓰는 모든 측정항목에 적용됩니다."
            startIcon={<Clock />}
          />
          <InputGroup
            id="suctionFlowRate"
            type="number"
            label="표준 흡인유량 (L/min)"
            placeholder="예: 1.0"
            value={form.suctionFlowRate}
            onChange={(value) => handleChange("suctionFlowRate", value)}
            min={0}
            maxDecimals={3}
            errorMessage={fieldErrors?.suctionFlowRate}
            helperText="비우면 미지정으로 저장됩니다. 통칭 시료(VOCs·VOCs-T)는 이 값이 그 병의 흡인유량입니다."
            startIcon={<Gauge />}
          />
        </div>
      </FieldGroup>
    </FormDialog>
  );
};
