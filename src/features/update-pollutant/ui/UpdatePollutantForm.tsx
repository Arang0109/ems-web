import { Hash, FlaskConical, FileText } from "lucide-react";

import { useUpdatePollutant } from "../model/hooks/use-update-pollutant";
import { useDeletePollutant } from "../model/hooks/use-delete-pollutant";

import type { Pollutant } from "@entities/pollutant";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle } from "@shared/ui/form";
import {
  MEASUREMENT_FIELD_LABEL, MEASUREMENT_METHOD_LABEL, POLLUTANT_PHASE_LABEL,
} from "@shared/config";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pollutant: Pollutant | null;
  onSuccess?: () => void;
}

/** 가이드가 비워 둘 수 있는 항목의 표시 자리. */
const EMPTY = "—";

/**
 * 측정물질 상세 편집.
 *
 * 측정분야·측정방법·형태는 지원 물질 가이드가 단일 진실 소스라 여기서 바꿀 수 없다
 * (법령이 개정되면 가이드를 통해 자동으로 반영된다). 편집 대상은 표기명과 분석 정보뿐이다.
 */
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
        <div className="flex items-center gap-2">
          <SectionTitle>측정물질 정보</SectionTitle>
          <span className="text-body-4 text-muted-foreground">{pollutant.code}</span>
        </div>

        {/* 가이드 소유값 — 읽기 전용이다. */}
        <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-body-4">
          <div>
            <dt className="text-muted-foreground">측정분야</dt>
            <dd>{MEASUREMENT_FIELD_LABEL[pollutant.field]}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">측정방법</dt>
            <dd>{pollutant.method ? MEASUREMENT_METHOD_LABEL[pollutant.method] : EMPTY}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">상</dt>
            <dd>{pollutant.phase ? POLLUTANT_PHASE_LABEL[pollutant.phase] : EMPTY}</dd>
          </div>
        </dl>
        <p className="text-body-4 text-muted-foreground">
          측정분야·측정방법·상은 법령 가이드가 정하므로 수정할 수 없습니다.
        </p>

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
