import { useState } from "react";

import type {
  SamplingInfoSave, SamplingSnapshot, ScheduleDetail, TeamSnapshot, TenantSnapshot,
} from "@entities/schedule";
import { useChangeTeamAction, useChangeTenantAction } from "@entities/schedule";

import type { ScheduleBasicInfoForm } from "../types";
import { fromBasicInfo, toSamplingInfoSave, toTeamSnapshotUpdate, toTenantSnapshotUpdate } from "../mapper";

// 값의 주인이 셋으로 갈려 있어 스냅샷 세 곳을 함께 받는다 — 채취 시각·현장 담당자는 채취
// 스냅샷, 서명란 담당자는 고객사 스냅샷, 측정자 표기는 팀 스냅샷이 갖는다.
interface Params {
  scheduleId: number | null;
  sampling: SamplingSnapshot | null;
  tenant: TenantSnapshot | null;
  team: TeamSnapshot | null;
}

/** 채취 스냅샷 소유 — 시트 저장 요청에 함께 실린다. */
const SAMPLING_FIELDS = [
  "samplingStartedAt", "samplingEndedAt", "facilityManager", "samplingWitness",
] as const;
/** 고객사 스냅샷 소유 — 실험·분석 탭과 공유한다. */
const TENANT_FIELDS = ["analyst", "technicalManager"] as const;
/** 팀 스냅샷 소유. */
const TEAM_FIELDS = ["mentorName", "menteeName"] as const;

/**
 * 측정계획 단위(공통) 채취 시각·담당자를 관리한다. 저장 트리거는 기록지 저장 버튼 하나이므로
 * useSaveSheets 가 이 훅을 합성한다.
 *
 * 채취 시각·현장 담당자는 **시트 저장 요청에 함께 실린다** — 같은 채취 스냅샷 노드에 살고
 * 이 화면이 함께 소유하므로 나눠 보낼 이유가 없다. 그래서 이 훅은 그 넷을 직접 저장하지 않고
 * `samplingInfo` 로 내어 준다.
 *
 * 남은 서명란 담당자·측정자 표기는 소유 노드가 달라 각자의 경로로 간다. 둘 다 **실제로 바뀐 것만**
 * 호출하므로, 채취 정보만 고친 흔한 경우에는 추가 왕복이 없다.
 */
export const useScheduleBasicInfo = ({ scheduleId, sampling, tenant, team }: Params) => {
  const { changeTenant, isLoading: isSavingTenant } = useChangeTenantAction();
  const { changeTeam, isLoading: isSavingTeam } = useChangeTeamAction();

  // 부모(SheetsEditor)를 리마운트하면 입력 중인 시트 폼까지 날아가므로 리마운트하지 않는다.
  const [form, setForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(sampling, tenant, team));
  const [baselineForm, setBaselineForm] = useState<ScheduleBasicInfoForm>(() => fromBasicInfo(sampling, tenant, team));

  const changed = (fields: readonly (keyof ScheduleBasicInfoForm)[]) =>
    fields.some((key) => form[key] !== baselineForm[key]);

  const isDirty = changed(SAMPLING_FIELDS) || changed(TENANT_FIELDS) || changed(TEAM_FIELDS);

  const handleChange = (name: keyof ScheduleBasicInfoForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  /** 시트 저장 요청에 실을 채취 정보. 서버가 부분 갱신으로 받으므로 현재 값을 그대로 보낸다. */
  const samplingInfo: SamplingInfoSave = toSamplingInfoSave(form);

  /**
   * 채취 정보 외 항목을 저장한다. 시트 저장이 끝난 뒤 그 응답을 받아 호출한다 —
   * 채취 정보는 이미 그 요청에 실려 저장됐으므로 여기서 다시 보내지 않는다.
   */
  const saveBasicInfo = async (savedDetail: ScheduleDetail): Promise<ScheduleDetail> => {
    if (scheduleId == null) return savedDetail;

    let detail = savedDetail;
    if (changed(TENANT_FIELDS)) {
      detail = await changeTenant(scheduleId, toTenantSnapshotUpdate(form));
    }
    if (changed(TEAM_FIELDS)) {
      detail = await changeTeam(scheduleId, toTeamSnapshotUpdate(form));
    }

    const next = fromBasicInfo(detail.snapshot.samplingData, detail.snapshot.tenant, detail.snapshot.team);
    setForm(next);
    setBaselineForm(next);
    return detail;
  };

  return {
    form,
    isDirty,
    isLoading: isSavingTenant || isSavingTeam,
    handleChange,
    samplingInfo,
    saveBasicInfo,
  };
};
