import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { MeasurementMethodUpdateForm } from "../types";
import { getDefaultForm } from "../types";
import { toMeasurementMethodUpdate } from "../mapper";
import { validateMeasurementMethodUpdateFields } from "../validator";

import { useUpdateMeasurementMethodAction } from "@entities/measurement-method";
import type { MeasurementMethod } from "@entities/measurement-method";
import { pollutantKeys } from "@entities/pollutant";

import { toast } from "@shared/ui/toasts";

interface Props {
  method: MeasurementMethod | null;
  onSuccess: () => void;
}

/**
 * 측정방법 수정.
 *
 * 측정물질 목록은 측정방법의 이름·채취시간을 조인해 보여주므로 저장 뒤 그쪽 캐시도 무효화한다.
 * 엔티티끼리는 서로를 import 하지 못하므로(같은 레이어) 이 교차 무효화는 feature 가 맡는다 —
 * `pollutantKeys` 가 index 로 노출돼 있는 이유가 이것이다.
 */
export const useUpdateMeasurementMethod = ({ method, onSuccess }: Props) => {
  const { updateMeasurementMethod, isLoading } = useUpdateMeasurementMethodAction();
  const queryClient = useQueryClient();

  // prop 초기화는 key 리마운트로 처리 — prop 은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<MeasurementMethodUpdateForm>(getDefaultForm(method));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MeasurementMethodUpdateForm, string>>>();

  const handleChange = <K extends keyof MeasurementMethodUpdateForm>(
    name: K,
    value: MeasurementMethodUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!method) return;

    const errors = validateMeasurementMethodUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const name = form.name.trim() || method.name;

    try {
      await updateMeasurementMethod(method.id, toMeasurementMethodUpdate(form));
      void queryClient.invalidateQueries({ queryKey: pollutantKeys.all });
      toast.success(`${name} 측정방법이 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    fieldErrors,

    handleChange,
    handleSubmit,
  };
};
