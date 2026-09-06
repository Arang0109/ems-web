import { useState } from "react";

import { useUpdateScheduleAction } from "@entities/schedule";
import type { ScheduleDetail } from "@entities/schedule";
import type { MeasurementType } from "@shared/model";
import { toast } from "@shared/ui/toasts";

import type { ScheduleBasicInfoUpdateForm } from "../types";
import { toScheduleMetaUpdate } from "../mapper";
import { validateScheduleBasicInfoFields } from "../validator";

interface Props {
  scheduleId: number;
  /** 이 회차의 계획 메타 — 폼의 초기값. 스냅샷이 아니라 응답 최상위가 진실의 원천이다. */
  schedule: ScheduleDetail;
  onSuccess: () => void;
}

export const useUpdateScheduleBasicInfo = ({
  scheduleId, schedule, onSuccess,
}: Props) => {
  const { updateSchedule, isLoading } = useUpdateScheduleAction();

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleBasicInfoUpdateForm>({
    referenceNumber: schedule.referenceNumber ?? "",
    measureDate: schedule.sampledAt ?? "",
    // 서버 계약은 자유 문자열이지만 입력은 Select 로 받는다 — 목록 밖의 값은 미지정으로 떨어진다.
    measurementType: (schedule.schedulePurpose as MeasurementType | null) ?? "",
  });

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleBasicInfoUpdateForm, string>>>();

  const handleChange = <K extends keyof ScheduleBasicInfoUpdateForm>(
    name: K, value: ScheduleBasicInfoUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleBasicInfoFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updateSchedule(scheduleId, toScheduleMetaUpdate(form));
      toast.success("사전 정보가 수정되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, fieldErrors, isLoading, handleChange, handleSubmit };
};
