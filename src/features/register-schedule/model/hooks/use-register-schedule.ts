import { useEffect, useRef, useState } from "react";
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

  /** 팀 상세로 사수·부사수를 이미 채운 팀. 같은 팀을 두 번 덮어쓰지 않기 위한 표식이다. */
  const appliedTeamIdRef = useRef("");

  // 하위 목록은 선택값을 따라온다 — 핸들러가 조회를 직접 부르지 않는다.
  const {
    clientOptions, workplaceOptions, stackOptions, teamOptions, userOptions,
    teamDetail, pollutantGroups, stackPollutantsLoading,
  } = useScheduleFormOptions({
    clientId: form.clientId,
    workplaceId: form.workplaceId,
    stackId: form.stackId,
    teamId: form.teamId,
  });

  // 팀 상세는 조회가 끝난 뒤에야 도착하므로 핸들러에서 바로 넣을 수 없다 —
  // 도착한 상세가 **지금 고른 팀**의 것일 때 한 번만 채우고, 그 뒤 사용자가 고친 값은
  // 배경 갱신이 다시 덮어쓰지 않게 적용한 팀을 기억해 둔다.
  useEffect(() => {
    if (!teamDetail || String(teamDetail.id) !== form.teamId) return;
    if (appliedTeamIdRef.current === form.teamId) return;

    appliedTeamIdRef.current = form.teamId;
    setForm((prev) => ({
      ...prev,
      mentorId: String(teamDetail.mentorUserId),
      menteeId: String(teamDetail.menteeUserId),
    }));
    setFieldErrors((prev) => ({ ...prev, mentorId: undefined, menteeId: undefined }));
  }, [teamDetail, form.teamId]);

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

  // 측정 팀 변경 → 사수·부사수 선택 초기화.
  // 팀에 등록된 사수·부사수는 상세 조회가 끝난 뒤 아래 effect 가 채운다.
  const handleTeamChange = (value: string) => {
    appliedTeamIdRef.current = "";
    setForm((prev) => ({ ...prev, teamId: value, mentorId: "", menteeId: "" }));
    setFieldErrors((prev) => ({ ...prev, teamId: undefined }));
  };

  // 측정항목(다중선택) — MultiSelect 가 선택 결과 배열을 통째로 준다.
  const handlePollutantsChange = (pollutantIds: string[]) => {
    setForm((prev) => ({ ...prev, pollutantIds }));
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
    handleTeamChange,
    handlePollutantsChange,
    handleSubmit,

    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,
    userOptions,

    pollutantGroups,
    stackPollutantsLoading,
  };
};
