import { useMemo, useState } from "react";

import { useRegisterPollutantAction, usePollutantCandidates } from "@entities/pollutant"
import type { PollutantCandidate } from "@entities/pollutant";
import { useMeasurementMethods } from "@entities/measurement-method";

import { getDefaultForm } from "../types";
import type { PollutantRegisterForm } from "../types";
import { toPollutantCreate } from "../mapper";
import { validatePollutantRegisterFields } from "../validator";

import { MEASUREMENT_FIELD_LABEL } from "@shared/config";
import { toast } from "@shared/ui/toasts";

interface Props {
  /** 모달이 열려 있는 동안에만 후보를 조회한다 */
  open: boolean;
  onSuccess: () => void;
}

const selectedCandidateOf = (candidates: PollutantCandidate[], catalogId: string) =>
  candidates.find((candidate) => String(candidate.catalogId) === catalogId) ?? null;

/**
 * 측정물질 채택.
 *
 * 후보 목록은 서버가 "아직 채택하지 않은 활성 가이드 항목"만 내려주므로, 여기서 걸러낼 것이 없다.
 * 채택에 성공하면 그 항목은 다음 조회부터 후보에서 빠진다.
 */
export const useRegisterPollutant = ({ open, onSuccess }: Props) => {
  const { registerPollutant, isLoading } = useRegisterPollutantAction();
  const { data: candidates, isLoading: isCandidatesLoading } =
    usePollutantCandidates({ enabled: open });
  // 측정방법은 열거값이 아니라 고객사가 등록해 둔 목록이다 — 없으면 먼저 측정방법 관리에서 만들어야 한다.
  const { data: methods, isLoading: isMethodsLoading } = useMeasurementMethods({ enabled: open });

  const [form, setForm] = useState<PollutantRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PollutantRegisterForm, string>>>();

  // 분야가 섞여 오므로 라벨에 분야를 붙인다 — 대기 납·수질 납처럼 이름이 같은 항목이 있다.
  const candidateOptions = useMemo(
    () => candidates.map((candidate) => ({
      value: String(candidate.catalogId),
      label: `${candidate.nameKr} (${MEASUREMENT_FIELD_LABEL[candidate.field]})`,
    })),
    [candidates],
  );

  const methodOptions = useMemo(
    () => methods.map((method) => ({ value: String(method.id), label: method.name })),
    [methods],
  );

  /** 고른 측정방법 — 통칭 채취면 항목별 채취시간을 받지 않고, 아니면 표준값을 placeholder 로 보여 준다. */
  const selectedMethod = useMemo(
    () => methods.find((method) => String(method.id) === form.methodId) ?? null,
    [methods, form.methodId],
  );

  /**
   * 입자상 물질에 가스상 채취(NONE 이 아닌) 측정방법을 붙였는가. 막지 않고 경고만 한다 —
   * 비소화합물(중금속 여지 + 흡수액)처럼 의도한 경우가 있어서다. 현장 기록지는 phase 가 아니라
   * 이 선택을 그대로 따르므로, PAH 를 카트리지(통칭 채취)에 붙이면 VOCs 병에 섞인다.
   */
  const isParticulateWithGasMethod =
    selectedCandidateOf(candidates, form.catalogId)?.phase === "PARTICLE"
    && selectedMethod !== null && selectedMethod.sampleGrouping !== "NONE";

  /** 선택한 가이드 항목 — 표기명 placeholder 와 읽기 전용 정보 표시에 쓴다. */
  const selectedCandidate = useMemo(
    () => selectedCandidateOf(candidates, form.catalogId),
    [candidates, form.catalogId],
  );

  const handleChange = <K extends keyof PollutantRegisterForm>(name: K, value: PollutantRegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validatePollutantRegisterFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const name = form.nameKr.trim() || selectedCandidate?.nameKr || "측정물질";

    try {
      await registerPollutant(toPollutantCreate(form));
      toast.success(`${name} 측정물질이 등록되었습니다.`);
      setForm(getDefaultForm());
      // 채택 목록과 후보는 같은 pollutantKeys 아래라, 등록 mutation 이 둘을 함께 갱신한다
      // — 방금 채택한 항목은 다음에 모달을 열 때 후보에서 빠져 있다.
      onSuccess();
    } catch(err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  }

  return {
    form,

    candidateOptions,
    selectedCandidate,
    isCandidatesLoading,
    methodOptions,
    isMethodsLoading,
    selectedMethod,
    isParticulateWithGasMethod,

    fieldErrors,

    handleSubmit,
    handleChange,

    isLoading
  }
}
