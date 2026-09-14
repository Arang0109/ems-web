import { useState } from "react";

import { useRegisterMeasurementMethodAction } from "@entities/measurement-method";

import { getDefaultForm } from "../types";
import type { MeasurementMethodRegisterForm } from "../types";
import { toMeasurementMethodCreate } from "../mapper";
import { validateMeasurementMethodRegisterFields } from "../validator";

import { toast } from "@shared/ui/toasts";

interface Props {
  onSuccess: () => void;
}

export const useRegisterMeasurementMethod = ({ onSuccess }: Props) => {
  const { registerMeasurementMethod, isLoading } = useRegisterMeasurementMethodAction();

  const [form, setForm] = useState<MeasurementMethodRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MeasurementMethodRegisterForm, string>>>();

  const handleChange = <K extends keyof MeasurementMethodRegisterForm>(
    name: K,
    value: MeasurementMethodRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateMeasurementMethodRegisterFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const name = form.name.trim();

    try {
      await registerMeasurementMethod(toMeasurementMethodCreate(form));
      toast.success(`${name} 측정방법이 등록되었습니다.`);
      setForm(getDefaultForm());
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "등록에 실패했습니다.";
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
