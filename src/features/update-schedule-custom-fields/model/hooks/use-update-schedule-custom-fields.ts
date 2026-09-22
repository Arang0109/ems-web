import { useState } from "react";

import { useSaveCustomFieldsAction } from "@entities/schedule";
import type { ScheduleCustomField } from "@entities/schedule-custom-field";

import type { ScheduleCustomFieldsForm } from "../types";
import { getDefaultForm } from "../types";
import { toScheduleCustomFieldsSave } from "../mapper";
import { validateScheduleCustomFieldsFields } from "../validator";

import { toast } from "@shared/ui/toasts";

interface Props {
  scheduleId: number;
  /** 이 고객사의 커스텀 필드 정의 — 칸의 집합과 순서 */
  definitions: ScheduleCustomField[];
  /** 이 회차의 현재 값 — 폼의 초기값 */
  values: Record<string, string> | null;
  onSuccess: () => void;
}

/**
 * 회차 커스텀 필드 값 저장. 이 폼이 단독 소유하는 경로라 **전체 채택**이다 — 정의된 칸 전부를 보내며,
 * 비운 칸은 지워진다. 계산 입력이 아니라 시트는 재계산되지 않는다.
 */
export const useUpdateScheduleCustomFields = ({ scheduleId, definitions, values, onSuccess }: Props) => {
  const { saveCustomFields, isLoading } = useSaveCustomFieldsAction();

  // prop 초기화는 key 리마운트로 처리 — prop 은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<ScheduleCustomFieldsForm>(getDefaultForm(definitions, values));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>();

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleCustomFieldsFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await saveCustomFields(scheduleId, toScheduleCustomFieldsSave(form, definitions));
      toast.success("커스텀 필드 값이 저장되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "저장에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, fieldErrors, isLoading, handleChange, handleSubmit };
};
