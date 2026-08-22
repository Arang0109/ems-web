import { useState } from "react";

import type { BasicInfo } from "@entities/schedule";
import { useUpdateBasicInfoAction } from "@entities/schedule";

import { toast } from "@shared/ui/toasts";

import { fromBasicInfo, toBasicInfoUpdate } from "../mapper";
import type { AnalysisProgressForm } from "../types";

interface Params {
  scheduleId: number | null;
  basicInfo: BasicInfo | null;
  onSaved?: () => void;
}

/**
 * 분석 진행 정보(시료접수·분석완료·성적서발행 일자, 시료분석검사자·기술책임자) 입력.
 *
 * 시료접수일자가 처음 저장되면 서버가 계획을 <b>측정중 → 분석값입력중</b>으로 전진시킨다.
 * 성적서 작성 완료는 분석값입력중에서만 확정할 수 있으므로, 이 입력이 확정의 선행 조건이다.
 */
export const useAnalysisProgress = ({ scheduleId, basicInfo, onSaved }: Params) => {
  const { updateBasicInfo, isLoading } = useUpdateBasicInfoAction();

  const [form, setForm] = useState<AnalysisProgressForm>(() => fromBasicInfo(basicInfo));
  const [baselineForm, setBaselineForm] = useState<AnalysisProgressForm>(() => fromBasicInfo(basicInfo));

  const isDirty = (Object.keys(form) as (keyof AnalysisProgressForm)[])
    .some((key) => form[key] !== baselineForm[key]);

  const handleChange = (name: keyof AnalysisProgressForm, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    if (scheduleId == null || !isDirty) return;

    try {
      const detail = await updateBasicInfo(scheduleId, toBasicInfoUpdate(form));
      const next = fromBasicInfo(detail.snapshot.basicInfo);
      setForm(next);
      setBaselineForm(next);
      toast.success("분석 진행 정보를 저장했습니다.");
      onSaved?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장에 실패했습니다.");
    }
  };

  return { form, isDirty, isLoading, handleChange, handleSave };
};
