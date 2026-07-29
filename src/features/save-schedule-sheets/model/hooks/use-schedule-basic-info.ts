import { useState } from "react";

import type { BasicInfo, TeamSnapshot } from "@entities/schedule";
import { useUpdateBasicInfoAction } from "@entities/schedule";

import type { ScheduleBasicInfoForm } from "../types";
import { toBasicInfoUpdate, fromBasicInfo } from "../mapper";

interface Params {
  scheduleId: number | null;
  basicInfo: BasicInfo | null;
  team: TeamSnapshot | null;
}

// 측정계획 단위(공통) 시료채취 시각·담당자를 관리한다. 시트와 다른 엔드포인트(PATCH basic-info)를 쓰지만
// 저장 트리거는 기록지 저장 버튼 하나로 통합되므로 useSaveSheets가 이 훅을 합성한다.
export const useScheduleBasicInfo = ({ scheduleId, basicInfo, team }: Params) => {
  const { updateBasicInfo, isLoading } = useUpdateBasicInfoAction();

  // 부모(SheetsEditor)를 리마운트하면 입력 중인 시트 폼까지 날아가므로 리마운트하지 않는다.
  // prop은 초기값으로만 쓰고, 저장 응답으로 재동기화한다.
  const [form, setForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(basicInfo, team));
  const [savedForm, setSavedForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(basicInfo, team));

  const isDirty = (Object.keys(form) as (keyof ScheduleBasicInfoForm)[])
    .some((key) => form[key] !== savedForm[key]);

  const handleChange = (name: keyof ScheduleBasicInfoForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  // 변경이 없으면 요청하지 않는다(시트만 고치는 저장마다 PATCH가 나가는 것 방지).
  // 실패 시 throw — 호출자가 toast로 최종 처리한다.
  const saveBasicInfo = async () => {
    if (scheduleId == null || !isDirty) return;

    const detail = await updateBasicInfo(scheduleId, toBasicInfoUpdate(form));
    const next = fromBasicInfo(detail.snapshot.basicInfo, detail.snapshot.team);
    setForm(next);
    setSavedForm(next);
  };

  return { form, isLoading, handleChange, saveBasicInfo };
};
