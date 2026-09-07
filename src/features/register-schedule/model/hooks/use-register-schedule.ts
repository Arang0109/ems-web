import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { ScheduleRegisterForm } from "../types";
import { getDefaultScheduleRegisterForm } from "../types";
import { toScheduleCreate } from "../mapper";
import { validateScheduleFields } from "../validator";
import { useScheduleFormOptions } from "./use-schedule-form-options";

import { useRegisterScheduleAction } from "@entities/schedule";

import { toast } from "@shared/ui/toasts";

export const useRegisterSchedule = () => {
  const navigate = useNavigate();
  const { registerSchedule, isLoading } = useRegisterScheduleAction();

  const [form, setForm] = useState<ScheduleRegisterForm>(getDefaultScheduleRegisterForm());
  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleRegisterForm, string>>>();

  // 하위 목록은 선택값을 따라온다 — 핸들러가 조회를 직접 부르지 않는다.
  const {
    clientOptions, workplaceOptions, stackOptions, teamOptions,
    stackPollutants, stackPollutantsLoading,
  } = useScheduleFormOptions({
    clientId: form.clientId,
    workplaceId: form.workplaceId,
    stackId: form.stackId,
  });

  const handleChange = (name: keyof ScheduleRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // 거래처 변경 → 하위(사업장·측정시설·측정항목) 선택 초기화.
  // 사업장 목록은 form.clientId 를 따라 저절로 갱신된다.
  const handleClientChange = (value: string) => {
    setForm((prev) => ({ ...prev, clientId: value, workplaceId: "", stackId: "", pollutantIds: [] }));
    setFieldErrors((prev) => ({ ...prev, clientId: undefined, workplaceId: undefined, stackId: undefined }));
  };

  // 사업장 변경 → 측정시설·측정항목 선택 초기화
  const handleWorkplaceChange = (value: string) => {
    setForm((prev) => ({ ...prev, workplaceId: value, stackId: "", pollutantIds: [] }));
    setFieldErrors((prev) => ({ ...prev, workplaceId: undefined, stackId: undefined }));
  };

  // 측정시설 변경 → 측정항목 선택 초기화
  const handleStackChange = (value: string) => {
    setForm((prev) => ({ ...prev, stackId: value, pollutantIds: [] }));
    setFieldErrors((prev) => ({ ...prev, stackId: undefined }));
  };

  // 측정항목 토글 (다중선택)
  const handleTogglePollutant = (pollutantId: number) => {
    const key = String(pollutantId);
    setForm((prev) => ({
      ...prev,
      pollutantIds: prev.pollutantIds.includes(key)
        ? prev.pollutantIds.filter((id) => id !== key)
        : [...prev.pollutantIds, key],
    }));
    setFieldErrors((prev) => ({ ...prev, pollutantIds: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerSchedule(toScheduleCreate(form));
      toast.success("측정계획이 등록되었습니다.");
      navigate("/schedule");
    } catch (err) {
      const message = err instanceof Error ? err.message : "등록에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    form,
    fieldErrors,
    isLoading,

    handleChange,
    handleClientChange,
    handleWorkplaceChange,
    handleStackChange,
    handleTogglePollutant,
    handleSubmit,

    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,

    stackPollutants,
    stackPollutantsLoading,
  };
};
