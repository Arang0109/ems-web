import { Ban, Hash, ListOrdered, RotateCcw } from "lucide-react";

import { useUpdatePollutantCatalog } from "../model/hooks/use-update-pollutant-catalog";
import { useTogglePollutantCatalog } from "../model/hooks/use-toggle-pollutant-catalog";

import type { PollutantCatalog } from "@entities/pollutant-catalog";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { Button } from "@shared/ui/buttons";
import { StatusDot } from "@shared/ui/badges";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import {
  measurementFieldOptions, measurementMethodOptions, pollutantPhaseOptions,
} from "@shared/model";
import type { MeasurementField, MeasurementMethod, PollutantPhase } from "@shared/model";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  catalog: PollutantCatalog | null;
  onSuccess?: () => void;
}

export const UpdatePollutantCatalogForm = ({ open, onOpenChange, catalog, onSuccess }: Props) => {
  const close = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const { form, fieldErrors, isLoading: isUpdating, handleChange, handleSubmit } =
    useUpdatePollutantCatalog({ catalog, onSuccess: close });

  const { isLoading: isToggling, isActive, toggleLabel, handleToggle } =
    useTogglePollutantCatalog({ catalog, onSuccess: close });

  if (!catalog) return;

  return (
    <FormDialog
      title="측정물질 카탈로그 상세"
      description="여기서 바꾼 값은 따로 덮어쓰지 않은 모든 고객사에 반영됩니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="수정"
      cancelLabel="닫기"
      isLoading={isUpdating || isToggling}
    >
      <FieldGroup>
        {/*
          폐지/해제는 푸터의 삭제 슬롯에 넣지 않는다 — 삭제 슬롯은 destructive 스타일이 고정이라
          되돌리는 방향인 "폐지 해제"까지 위험한 액션으로 보이기 때문이다.
        */}
        <div className="flex items-center justify-between gap-3">
          <StatusDot
            tone={isActive ? 'progress' : 'done'}
            label={isActive ? '사용 중' : '폐지됨'}
            pill
          />
          <Button
            type="button"
            variant={isActive ? 'destructive' : 'outline'}
            onClick={handleToggle}
            disabled={isToggling}
            startIcon={isActive ? Ban : RotateCcw}
          >
            {toggleLabel}
          </Button>
        </div>

        <SectionTitle>물질 식별</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4">
          {/* code 는 서버가 수정 대상에서 제외한다 — 읽기 전용으로만 보여준다 */}
          <InputGroup
            id="code"
            label="코드"
            value={catalog.code}
            readOnly
            helperText="측정계획 스냅샷이 이 값을 보관하므로 변경할 수 없습니다."
            startIcon={<Hash />}
          />
          <Select
            id="field"
            label="측정분야"
            placeholder="측정분야 선택"
            options={measurementFieldOptions}
            value={form.field}
            onValueChange={(value) => value && handleChange("field", value as MeasurementField)}
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
