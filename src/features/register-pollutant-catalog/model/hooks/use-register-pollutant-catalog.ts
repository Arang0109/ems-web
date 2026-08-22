import { useState } from "react";

import { useRegisterPollutantCatalogAction } from "@entities/pollutant-catalog";

import { getDefaultForm } from "../types";
import type { PollutantCatalogRegisterForm } from "../types";
import { toPollutantCatalogCreate } from "../mapper";
import { validatePollutantCatalogRegisterFields } from "../validator";

import { ERROR_MESSAGE } from "@shared/config";
import { toast } from "@shared/ui/toasts";

interface Props {
  onSuccess: () => void;
}

export const useRegisterPollutantCatalog = ({ onSuccess }: Props) => {
  const { registerPollutantCatalog, isLoading } = useRegisterPollutantCatalogAction();

  const [form, setForm] = useState<PollutantCatalogRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof PollutantCatalogRegisterForm, string>>>();

  const handleChange = <K extends keyof PollutantCatalogRegisterForm>(
    name: K,
    value: PollutantCatalogRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validatePollutantCatalogRegisterFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerPollutantCatalog(toPollutantCatalogCreate(form));
      toast.success("측정물질 카탈로그가 등록되었습니다.");
      setForm(getDefaultForm());
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGE.CREATE;
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
