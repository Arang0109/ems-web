import { Hash, ListOrdered, Plus } from "lucide-react";

import { useRegisterPollutantCatalog } from "../model/hooks/use-register-pollutant-catalog";

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
  onSuccess?: () => void;
}

export const RegisterPollutantCatalogForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useRegisterPollutantCatalog({
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      triggerLabel={<><Plus />물질 추가</>}
      title="측정물질 카탈로그 등록"
      description="모든 고객사가 공통으로 사용하는 법정 측정물질을 추가합니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="등록"
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>물질 식별</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="code"
            label="코드"
            placeholder="예: NOX"
            value={form.code}
            onChange={(value) => handleChange("code", value.toUpperCase())}
            invalid={!!fieldErrors?.code}
            error={fieldErrors?.code}
            // 등록 후에는 바꿀 수 없다 — 측정계획 스냅샷과 프론트 분기가 이 값에 의존한다
            helperText="등록 후에는 변경할 수 없습니다. 화학식·원소기호를 우선합니다."
            required
            startIcon={<Hash />}
          />
          <Select
            id="field"
            label="측정분야"
            placeholder="측정분야 선택"
            options={measurementFieldOptions}
            value={form.field}
            onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
            helperText="코드는 분야 안에서만 유일합니다(대기 납·수질 납이 모두 PB)."
            required
          />
        </div>
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
        </div>
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

        <InputGroup
          id="sortOrder"
          label="노출 순서"
          placeholder="예: 200"
          value={form.sortOrder}
          onChange={(value) => handleChange("sortOrder", value)}
          invalid={!!fieldErrors?.sortOrder}
          error={fieldErrors?.sortOrder}
          helperText="고객사 선택 목록에서의 정렬 기준입니다. 비우면 미지정입니다."
          startIcon={<ListOrdered />}
        />
      </FieldGroup>
    </FormDialog>
  );
};
