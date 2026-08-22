import { useState } from "react";

import { useUpdatePollutantCatalogAction } from "@entities/pollutant-catalog";
import type { PollutantCatalog } from "@entities/pollutant-catalog";

import { getDefaultForm } from "../types";
import type { PollutantCatalogUpdateForm } from "../types";
import { toPollutantCatalogUpdate } from "../mapper";
import { validatePollutantCatalogUpdateFields } from "../validator";

import { ERROR_MESSAGE } from "@shared/config";
import { toast } from "@shared/ui/toasts";

interface Props {
  catalog: PollutantCatalog | null;
  onSuccess: () => void;
}

export const useUpdatePollutantCatalog = ({ catalog, onSuccess }: Props) => {
  const { updatePollutantCatalog, isLoading } = useUpdatePollutantCatalogAction();

  // prop 초기화는 key 리마운트로 처리 — prop은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<PollutantCatalogUpdateForm>(getDefaultForm(catalog));
  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof PollutantCatalogUpdateForm, string>>>();

  const handleChange = <K extends keyof PollutantCatalogUpdateForm>(
    name: K,
    value: PollutantCatalogUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!catalog) return;

    const errors = validatePollutantCatalogUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updatePollutantCatalog(catalog.id, toPollutantCatalogUpdate(form));
      toast.success(`${form.nameKr.trim()} 카탈로그가 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGE.UPDATE;
      toast.error(message);
    }
  };

  return {
    form,

    fieldErrors,

    handleChange,
    handleSubmit,

    isLoading,
  };
};
