import { useState } from "react";

import { useUpdateScheduleAction } from "@entities/schedule";
import type { BasicInfo, TenantSnapshot } from "@entities/schedule";
import { toast } from "@shared/ui/toasts";

import type { ScheduleBasicInfoUpdateForm } from "../types";
import { toScheduleMetaUpdate } from "../mapper";
import { validateScheduleBasicInfoFields } from "../validator";

interface Props {
  scheduleId: number;
  /** 이 회차 문서의 기본정보 — 폼의 초기값 */
  basicInfo: BasicInfo;
  /** 조회된 고객사 스냅샷. 값을 바꾸려는 것이 아니라 서버의 덮어쓰기로부터 지키기 위해 되돌려 보낸다. */
  tenant: TenantSnapshot | null;
  onSuccess: () => void;
}

export const useUpdateScheduleBasicInfo = ({
  scheduleId, basicInfo, tenant, onSuccess,
}: Props) => {
  const { updateSchedule, isLoading } = useUpdateScheduleAction();

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleBasicInfoUpdateForm>({
    referenceNumber: basicInfo.referenceNumber ?? "",
    measureDate: basicInfo.sampledAt ?? "",
    measurementType: basicInfo.schedulePurpose ?? "",
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
      await updateSchedule(scheduleId, toScheduleMetaUpdate(form, tenant));
      toast.success("사전 정보가 수정되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, fieldErrors, isLoading, handleChange, handleSubmit };
};
