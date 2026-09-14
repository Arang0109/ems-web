import { useRegisterPollutant } from "../model/hooks/use-register-pollutant";

// UI
import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";
import { FieldGroup, InputGroup, SectionTitle, Select } from "@shared/ui/form";
import { MEASUREMENT_FIELD_LABEL, MEASUREMENT_MODE_LABEL, POLLUTANT_PHASE_LABEL } from "@shared/config";

// Icon
import { Clock, FlaskConical, FileText, Hash, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

/** 가이드가 비워 둘 수 있는 항목의 표시 자리. */
const EMPTY = "—";

/**
 * 측정물질 등록 — 지원 물질 가이드에서 **채택**한다.
 *
 * 고객사는 가이드에 없는 물질을 만들 수 없으므로 이 폼의 첫 입력은 가이드 항목 선택이다.
 * 측정분야·형태는 가이드가 정하므로 입력받지 않고 선택 결과만 보여 준다.
 * 측정방법은 같은 물질이라도 업체마다 다를 수 있어(이황화메틸: 테드라백·카트리지) 고객사가 직접 고른다.
 */
export const RegisterPollutantForm = ({ open, onOpenChange, onSuccess }: Props) => {
  const {
    form, fieldErrors, isLoading,
    candidateOptions, selectedCandidate, isCandidatesLoading,
    methodOptions, isMethodsLoading, selectedMethod, isParticulateWithGasMethod,
    handleChange, handleSubmit,
  } = useRegisterPollutant({
    open,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const hasCandidates = candidateOptions.length > 0;
  const hasMethods = methodOptions.length > 0;
  // 한 병으로 함께 채취하면 항목마다 시간이 다를 수 없다 — 입력을 닫아 서버 400 을 피한다.
  const isMerged = selectedMethod?.sampleGrouping === "MERGED";

  return(
    <FormDialog
      triggerLabel={<><Plus />측정물질 등록</>}
      title="측정물질 등록"
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel='등록'
      isLoading={isLoading}
    >
      <FieldGroup>
        <SectionTitle>측정물질 선택</SectionTitle>
        <Select
          id="catalogId"
          searchable
          label="측정물질"
          placeholder={
            isCandidatesLoading ? "불러오는 중…"
              : hasCandidates ? "측정물질 선택"
              : "채택할 수 있는 물질이 없습니다"
          }
          options={candidateOptions}
          value={form.catalogId}
          onValueChange={(value) => value && handleChange("catalogId", value)}
          disabled={isCandidatesLoading || !hasCandidates}
          helperText={
            fieldErrors?.catalogId
              ?? (!isCandidatesLoading && !hasCandidates
                ? "가이드의 모든 물질을 이미 등록했습니다."
                : undefined)
          }
          required
        />

        {/* 가이드가 정하는 값이라 입력받지 않는다 — 무엇을 고른 것인지 확인만 시켜 준다. */}
        {selectedCandidate && (
          <dl className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-3 text-body-4">
            <div>
              <dt className="text-muted-foreground">측정분야</dt>
              <dd>{MEASUREMENT_FIELD_LABEL[selectedCandidate.field]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">상</dt>
              <dd>{selectedCandidate.phase ? POLLUTANT_PHASE_LABEL[selectedCandidate.phase] : EMPTY}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">측정방식</dt>
              <dd>{selectedCandidate.mode ? MEASUREMENT_MODE_LABEL[selectedCandidate.mode] : EMPTY}</dd>
            </div>
          </dl>
        )}

        <Divider />

        <SectionTitle>우리 회사 관리 정보</SectionTitle>
        {/* 측정방법은 가이드가 정하지 않는다 — 우리 회사가 등록해 둔 측정방법 중에서 고른다. */}
        <div className="grid md:grid-cols-2 gap-4">
          <Select
            id="methodId"
            label="측정방법"
            placeholder={
              isMethodsLoading ? "불러오는 중…"
                : hasMethods ? "측정방법 선택"
                : "등록된 측정방법이 없습니다"
            }
            options={methodOptions}
            value={form.methodId}
            onValueChange={(value) => value && handleChange("methodId", value)}
            disabled={isMethodsLoading || !hasMethods}
            helperText={
              fieldErrors?.methodId
                ?? (!isMethodsLoading && !hasMethods
                  ? "측정방법 관리에서 먼저 측정방법을 등록하세요."
                  : isParticulateWithGasMethod
                    ? "⚠ 입자상 물질에 가스상 채취 방법을 붙였습니다. 기록지 가스상 표에 행이 생깁니다 — 흡수액 병행(비소화합물)처럼 의도한 경우만 그대로 두세요."
                    : "같은 물질이라도 회사마다 다를 수 있어 직접 정합니다.")
            }
            required
          />
          <InputGroup
            id="samplingMinutes"
            type="number"
            label="항목 채취시간 (분)"
            value={isMerged ? "" : form.samplingMinutes}
            onChange={(value) => handleChange("samplingMinutes", value)}
            disabled={!selectedMethod || isMerged}
            min={0}
            maxDecimals={0}
            invalid={!!fieldErrors?.samplingMinutes}
            error={fieldErrors?.samplingMinutes}
            startIcon={<Clock />}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <InputGroup
            id="nameKr"
            label="측정물질(한글)"
            // 비워 두면 서버가 가이드 국문명을 복사하므로 필수가 아니다.
            placeholder={selectedCandidate?.nameKr ?? "비워 두면 표준 국문명을 사용합니다"}
            value={form.nameKr}
            onChange={(value) => handleChange("nameKr", value)}
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
}
