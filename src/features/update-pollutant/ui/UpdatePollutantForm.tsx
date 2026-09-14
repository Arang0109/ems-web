import { Clock, Gauge, Hash, FlaskConical, FileText } from "lucide-react";

import { useUpdatePollutant } from "../model/hooks/use-update-pollutant";
import { useDeletePollutant } from "../model/hooks/use-delete-pollutant";

import type { Pollutant } from "@entities/pollutant";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_MODE_LABEL, POLLUTANT_PHASE_LABEL } from "@shared/config";

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
 * 측정분야·형태는 지원 물질 가이드가 단일 진실 소스라 여기서 바꿀 수 없다
 * (법령이 개정되면 가이드를 통해 자동으로 반영된다). 편집 대상은 측정방법·표기명·분석 정보다.
 * 측정방법은 같은 물질이라도 회사마다 다를 수 있어 고객사가 직접 정한다.
 */
export const UpdatePollutantForm = ({ open, onOpenChange, pollutant, onSuccess }: Props) => {
  const close = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const {
    form, fieldErrors, isLoading: isUpdating,
    methodOptions, isMethodsLoading, selectedMethod, isParticulateWithGasMethod,
    handleChange, handleSubmit,
  } = useUpdatePollutant({ pollutant, open, onSuccess: close });

  const { isLoading: isDeleting, handleDelete } =
    useDeletePollutant({ pollutant, onSuccess: close });

  if (!pollutant) return;

  // 한 병으로 함께 채취하면 항목마다 시간이 다를 수 없다 — 입력을 닫아 서버 400 을 피한다.
  // 목록을 아직 못 받았으면 원장 투영값으로 판단한다.
  const isMerged = (selectedMethod?.sampleGrouping ?? pollutant.sampleGrouping) === "MERGED";
  const methodDefault = selectedMethod?.samplingMinutes ?? pollutant.methodSamplingMinutes;
  const methodFlowRate = selectedMethod?.suctionFlowRate ?? pollutant.methodSuctionFlowRate;

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
        <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-body-4">
          <div>
            <dt className="text-muted-foreground">측정분야</dt>
            <dd>{MEASUREMENT_FIELD_LABEL[pollutant.field]}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">상</dt>
            <dd>{pollutant.phase ? POLLUTANT_PHASE_LABEL[pollutant.phase] : EMPTY}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">측정방식</dt>
            <dd>{pollutant.mode ? MEASUREMENT_MODE_LABEL[pollutant.mode] : EMPTY}</dd>
          </div>
        </dl>
        <p className="text-body-4 text-muted-foreground">
          측정분야·상·측정방식은 법령 가이드가 정하므로 수정할 수 없습니다.
        </p>

        {/* 측정방법은 고객사 소유값 — 정해지지 않은 레거시 행은 비어 있을 수 있어 여기서 채운다.
            채취 단위·표준 채취시간은 측정방법이 갖고 있으므로 여기서는 고르기만 한다. */}
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="methodId"
            label="측정방법"
            placeholder={isMethodsLoading ? "불러오는 중…" : "측정방법 선택"}
            options={methodOptions}
            value={form.methodId}
            onValueChange={(value) => value && handleChange("methodId", value)}
            disabled={isMethodsLoading}
            helperText={
              isParticulateWithGasMethod
                ? "⚠ 입자상 물질에 가스상 채취 방법을 붙였습니다. 기록지 가스상 표에 행이 생깁니다 — 흡수액 병행(비소화합물)처럼 의도한 경우만 그대로 두세요."
                : "같은 물질이라도 회사마다 다를 수 있어 직접 정합니다."
            }
          />
          {/* 항목별 채취시간 — 흡수액처럼 물질마다 시간이 다른 방법에서만 뜻이 있다. 비우면 방법 표준값으로 되돌아간다. */}
          <InputGroup
            id="samplingMinutes"
            type="number"
            label="항목 채취시간 (분)"
            placeholder={
              isMerged ? "통칭 채취는 측정방법 값을 따릅니다"
                : methodDefault != null ? `비우면 ${methodDefault}분(측정방법 표준)`
                : "비우면 측정방법 표준값을 따릅니다"
            }
            value={isMerged ? "" : form.samplingMinutes}
            onChange={(value) => handleChange("samplingMinutes", value)}
            disabled={isMerged}
            min={0}
            maxDecimals={0}
            invalid={!!fieldErrors?.samplingMinutes}
            error={fieldErrors?.samplingMinutes}
            helperText={
              isMerged
                ? "한 병으로 함께 채취하는 방법은 측정방법 관리에서 시간을 바꿉니다."
                : "이 항목에만 적용됩니다. 측정방법 표준값은 측정방법 관리에서 바꿉니다."
            }
            startIcon={<Clock />}
          />
          {/* 항목별 흡인유량 — 흡수액은 물질마다 유량이 정해져 있다. 통칭 시료(VOCs·VOCs-T)는 측정방법이 정한다. */}
          <InputGroup
            id="suctionFlowRate"
            type="number"
            label="항목 흡인유량 (L/min)"
            placeholder={
              isMerged ? "통칭 채취는 측정방법 값을 따릅니다"
                : methodFlowRate != null ? `비우면 ${methodFlowRate} L/min(측정방법 표준)`
                : "비우면 측정방법 표준값을 따릅니다"
            }
            value={isMerged ? "" : form.suctionFlowRate}
            onChange={(value) => handleChange("suctionFlowRate", value)}
            disabled={isMerged}
            min={0}
            maxDecimals={3}
            invalid={!!fieldErrors?.suctionFlowRate}
            error={fieldErrors?.suctionFlowRate}
            helperText={
              isMerged
                ? "한 병으로 함께 채취하는 방법은 측정방법 관리에서 유량을 바꿉니다."
                : "이 항목에만 적용됩니다. 측정방법 표준값은 측정방법 관리에서 바꿉니다."
            }
            startIcon={<Gauge />}
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
