import { useState } from "react";

import type { SamplingSnapshot, TeamSnapshot, TenantSnapshot } from "@entities/schedule";
import { useUpdateBasicInfoAction } from "@entities/schedule";

import type { ScheduleBasicInfoForm } from "../types";
import { toBasicInfoUpdate, fromBasicInfo } from "../mapper";

// 값의 주인이 셋으로 갈려 있어 스냅샷 세 곳을 함께 받는다 — 채취 시각·현장 담당자는 채취
// 스냅샷, 서명란 담당자는 고객사 스냅샷, 측정자 표기는 팀 스냅샷이 갖는다.
interface Params {
  scheduleId: number | null;
  sampling: SamplingSnapshot | null;
  tenant: TenantSnapshot | null;
  team: TeamSnapshot | null;
}

// 측정계획 단위(공통) 시료채취 시각·담당자를 관리한다. 시트와 다른 엔드포인트(PATCH basic-info)를 쓰지만
// 저장 트리거는 기록지 저장 버튼 하나로 통합되므로 useSaveSheets가 이 훅을 합성한다.
export const useScheduleBasicInfo = ({ scheduleId, sampling, tenant, team }: Params) => {
  const { updateBasicInfo, isLoading } = useUpdateBasicInfoAction();

  // 부모(SheetsEditor)를 리마운트하면 입력 중인 시트 폼까지 날아가므로 리마운트하지 않는다.
  const [form, setForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(sampling, tenant, team));
  const [baselineForm, setBaselineForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(sampling, tenant, team));

  const isDirty = (Object.keys(form) as (keyof ScheduleBasicInfoForm)[])
    .some((key) => form[key] !== baselineForm[key]);

  const handleChange = (name: keyof ScheduleBasicInfoForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const saveBasicInfo = async () => {
    if (scheduleId == null || !isDirty) return;

    const detail = await updateBasicInfo(scheduleId, toBasicInfoUpdate(form));
    const next = fromBasicInfo(
      detail.snapshot.samplingData, detail.snapshot.tenant, detail.snapshot.team);
    setForm(next);
    setBaselineForm(next);
  };

  return { form, isDirty, isLoading, handleChange, saveBasicInfo };
};
