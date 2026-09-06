import { useMemo, useState } from "react";

import { useRegisterPollutantAction, usePollutantCandidates } from "@entities/pollutant"

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

/**
 * 측정물질 채택.
 *
 * 후보 목록은 서버가 "아직 채택하지 않은 활성 가이드 항목"만 내려주므로, 여기서 걸러낼 것이 없다.
 * 채택에 성공하면 그 항목은 다음 조회부터 후보에서 빠진다.
 */
export const useRegisterPollutant = ({ open, onSuccess }: Props) => {
  const { registerPollutant, isLoading } = useRegisterPollutantAction();
  const { data: candidates, isLoading: isCandidatesLoading, refetch: refetchCandidates } =
    usePollutantCandidates({ enabled: open });

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

  /** 선택한 가이드 항목 — 표기명 placeholder 와 읽기 전용 정보 표시에 쓴다. */
  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => String(candidate.catalogId) === form.catalogId) ?? null,
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
      // 방금 채택한 항목을 후보에서 빼둔다 — 모달을 다시 열었을 때 중복 선택을 막는다.
      refetchCandidates();
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

    fieldErrors,

    handleSubmit,
    handleChange,

    isLoading
  }
}
