import { useMemo, useState } from "react";

import type { PollutantUpdateForm } from "../types";
import { getDefaultForm } from "../types";
import { toPollutantUpdate } from "../mapper";
import { validatePollutantUpdateFields } from "../validator";

import { useUpdatePollutantAction } from "@entities/pollutant";
import type { Pollutant } from "@entities/pollutant";
import { useMeasurementMethods } from "@entities/measurement-method";

import { toast } from "@shared/ui/toasts";

interface Props {
  pollutant: Pollutant | null;
  /** 모달이 열려 있는 동안에만 측정방법 목록을 조회한다 */
  open: boolean;
  onSuccess: () => void;
}

/**
 * 측정물질 상세 편집.
 *
 * 목록에는 이 고객사가 채택한 물질만 오므로 저장은 항상 수정(PUT)이다.
 * 다른 가이드 항목으로 바꾸는 것은 지원하지 않는다 — 삭제 후 다시 채택한다.
 */
export const useUpdatePollutant = ({ pollutant, open, onSuccess }: Props) => {
  const { updatePollutant, isLoading } = useUpdatePollutantAction();
  const { data: methods, isLoading: isMethodsLoading } = useMeasurementMethods({ enabled: open });

  const methodOptions = useMemo(
    () => methods.map((method) => ({ value: String(method.id), label: method.name })),
    [methods],
  );

  // prop 초기화는 key 리마운트로 처리 — prop은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<PollutantUpdateForm>(getDefaultForm(pollutant));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PollutantUpdateForm, string>>>();

  /** 고른 측정방법 — 통칭 채취면 항목별 채취시간을 받지 않고, 아니면 표준값을 placeholder 로 보여 준다. */
  const selectedMethod = useMemo(
    () => methods.find((method) => String(method.id) === form.methodId) ?? null,
    [methods, form.methodId],
  );

  const handleChange = <K extends keyof PollutantUpdateForm>(
    name: K,
    value: PollutantUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pollutant) return;

    const errors = validatePollutantUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const name = form.nameKr.trim() || pollutant.nameKr;

    try {
      await updatePollutant(pollutant.id, toPollutantUpdate(form));
      toast.success(`${name} 측정물질이 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  // 입자상 물질에 가스상 채취(NONE 이 아닌) 방법 — 막지 않고 경고만 한다(비소화합물처럼 의도한 경우가 있다).
  // 목록을 아직 못 받았으면 원장 투영값으로 판단한다.
  const grouping = selectedMethod?.sampleGrouping ?? pollutant?.sampleGrouping ?? null;
  const isParticulateWithGasMethod =
    pollutant?.phase === "PARTICLE" && grouping !== null && grouping !== "NONE";

  return {
    form,
    isLoading,

    methodOptions,
    isMethodsLoading,
    selectedMethod,
    isParticulateWithGasMethod,

    fieldErrors,

    handleChange,
    handleSubmit,
  };
};
