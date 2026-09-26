import { useState } from "react";

import type { ScheduleCustomFieldUpdateForm } from "../types";
import { getDefaultForm } from "../types";
import { toScheduleCustomFieldUpdate } from "../mapper";
import { validateScheduleCustomFieldUpdateFields } from "../validator";

import { useUpdateScheduleCustomFieldAction } from "@entities/schedule-custom-field";
import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import { toast } from "@shared/ui/toasts";

interface Props {
  field: ScheduleCustomField | null;
  onSuccess: () => void;
}

/** 커스텀 필드 수정. 라벨·표시 순서만 바뀌고 키는 그대로다 — 이미 저장된 회차 값과 배포된 양식이 그 키를 쓴다. */
export const useUpdateScheduleCustomField = ({ field, onSuccess }: Props) => {
  const { updateScheduleCustomField, isLoading } = useUpdateScheduleCustomFieldAction();

  // prop 초기화는 key 리마운트로 처리 — prop 은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<ScheduleCustomFieldUpdateForm>(getDefaultForm(field));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ScheduleCustomFieldUpdateForm, string>>>();

  const handleChange = <K extends keyof ScheduleCustomFieldUpdateForm>(
    name: K,
    value: ScheduleCustomFieldUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!field) return;

    const errors = validateScheduleCustomFieldUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updateScheduleCustomField(field.id, toScheduleCustomFieldUpdate(form));
      toast.success(`커스텀 필드 ${field.key} 가 수정되었습니다.`);
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
