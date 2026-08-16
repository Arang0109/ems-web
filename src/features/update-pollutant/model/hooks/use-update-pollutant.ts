import { useState } from "react";

import type { PollutantUpdateForm } from "../types";
import { getDefaultForm } from "../types";
import { toPollutantUpdate } from "../mapper";
import { validatePollutantUpdateFields } from "../validator";

import { useUpdatePollutantAction } from "@entities/pollutant";
import type { Pollutant } from "@entities/pollutant";

import { toast } from "@shared/ui/toasts";

interface Props {
  pollutant: Pollutant | null;
  onSuccess: () => void;
}

export const useUpdatePollutant = ({ pollutant, onSuccess }: Props) => {
  const { updatePollutant, isLoading } = useUpdatePollutantAction();

  // prop 초기화는 key 리마운트로 처리 — prop은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<PollutantUpdateForm>(getDefaultForm(pollutant));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PollutantUpdateForm, string>>>();

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

    try {
      await updatePollutant(pollutant.id, toPollutantUpdate(form));
      toast.success(`${form.nameKr.trim()} 측정물질이 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
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
