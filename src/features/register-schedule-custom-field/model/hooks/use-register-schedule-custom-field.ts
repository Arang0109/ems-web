import { useState } from "react";

import { useRegisterScheduleCustomFieldAction } from "@entities/schedule-custom-field";

import { getDefaultForm } from "../types";
import type { ScheduleCustomFieldRegisterForm } from "../types";
import { toScheduleCustomFieldCreate } from "../mapper";
import { validateScheduleCustomFieldRegisterFields } from "../validator";

import { toast } from "@shared/ui/toasts";

interface Props {
  onSuccess: () => void;
}

export const useRegisterScheduleCustomField = ({ onSuccess }: Props) => {
  const { registerScheduleCustomField, isLoading } = useRegisterScheduleCustomFieldAction();

  const [form, setForm] = useState<ScheduleCustomFieldRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ScheduleCustomFieldRegisterForm, string>>>();

  const handleChange = <K extends keyof ScheduleCustomFieldRegisterForm>(
    name: K,
    value: ScheduleCustomFieldRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleCustomFieldRegisterFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const key = form.key.trim();

    try {
      await registerScheduleCustomField(toScheduleCustomFieldCreate(form));
      toast.success(`커스텀 필드 ${key} 가 등록되었습니다.`);
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
