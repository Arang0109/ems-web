import { useState } from "react";

import type { ScheduleDetail } from "@entities/schedule";
import { useChangeTenantAction, useUpdateReportDatesAction } from "@entities/schedule";

import { toast } from "@shared/ui/toasts";

import { fromBasicInfo, toReportDatesUpdate, toTenantSnapshotUpdate } from "../mapper";
import type { AnalysisProgressForm } from "../types";

/** 일자 셋은 메타, 서명란 담당자는 고객사 스냅샷 — 소유가 갈려 저장 경로도 갈린다. */
const DATE_FIELDS = ["receivedAt", "analyzedAt", "issuedAt"] as const;
const STAFF_FIELDS = ["analyst", "technicalManager"] as const;

interface Params {
  scheduleId: number | null;
  /** 이 회차의 상세 — 일자 셋은 최상위, 서명란 담당자는 snapshot.tenant 에서 읽는다. */
  schedule: ScheduleDetail | null;
  onSaved?: () => void;
}

/**
 * 분석 진행 정보(시료접수·분석완료·성적서발행 일자, 시료분석검사자·기술책임자) 입력.
 *
 * 시료접수일자가 처음 저장되면 서버가 계획을 <b>측정중 → 분석값입력중</b>으로 전진시킨다.
 * 성적서 작성 완료는 분석값입력중에서만 확정할 수 있으므로, 이 입력이 확정의 선행 조건이다.
 *
 * <p>저장 경로가 둘로 갈린다 — 일자 셋은 이 탭이 단독 소유하는 메타(`PATCH /report-dates`)이고,
 * 서명란 담당자는 현장 채취 탭과 공유하는 문서(`PATCH /tenant`)다. 소유가 다르면 null의 뜻도
 * 달라지므로 한 요청에 묶지 않는다. <b>실제로 바뀐 쪽만</b> 호출해 왕복을 늘리지 않는다.
 */
export const useAnalysisProgress = ({ scheduleId, schedule, onSaved }: Params) => {
  const { updateReportDates, isLoading: isSavingDates } = useUpdateReportDatesAction();
  const { changeTenant, isLoading: isSavingStaff } = useChangeTenantAction();

  const [form, setForm] = useState<AnalysisProgressForm>(() => fromBasicInfo(schedule));
  const [baselineForm, setBaselineForm] = useState<AnalysisProgressForm>(() => fromBasicInfo(schedule));

  const changed = (fields: readonly (keyof AnalysisProgressForm)[]) =>
    fields.some((key) => form[key] !== baselineForm[key]);

  const isDirty = changed(DATE_FIELDS) || changed(STAFF_FIELDS);

  const handleChange = (name: keyof AnalysisProgressForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    if (scheduleId == null || !isDirty) return;

    try {
      // 마지막 응답이 두 저장을 모두 반영하도록 순차로 보낸다.
      let detail = schedule;
      if (changed(DATE_FIELDS)) {
        detail = await updateReportDates(scheduleId, toReportDatesUpdate(form));
      }
      if (changed(STAFF_FIELDS)) {
        detail = await changeTenant(scheduleId, toTenantSnapshotUpdate(form));
      }

      const next = fromBasicInfo(detail);
      setForm(next);
      setBaselineForm(next);
      toast.success("분석 진행 정보를 저장했습니다.");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  return { form, isDirty, isLoading: isSavingDates || isSavingStaff, handleChange, handleSave };
};
