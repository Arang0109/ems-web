import { useState } from "react";

import { useChangeClientAction } from "@entities/schedule";
import type { StackSnapshot } from "@entities/schedule";
import { toFormValue } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import type { ScheduleStackUpdateForm } from "../types";
import { toStackSnapshotUpdate } from "../mapper";
import { validateScheduleStackFields } from "../validator";

interface Props {
  scheduleId: number;
  stack: StackSnapshot;
  onSuccess: () => void;
}

export const useUpdateScheduleStack = ({ scheduleId, stack, onSuccess }: Props) => {
  const { changeClient, isLoading } = useChangeClientAction();

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleStackUpdateForm>({
    field: stack.field,
    name: stack.name ?? "",
    semsNumber: stack.semsNumber ?? "",
    grade: stack.grade,
    mainProduct: stack.mainProduct ?? "",
    standardOxygen: toFormValue(stack.standardOxygen),
    height: toFormValue(stack.height),
    horizontalLength: toFormValue(stack.horizontalLength),
    verticalLength: toFormValue(stack.verticalLength),
    shape: stack.shape,
    orientation: stack.orientation,
  });

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleStackUpdateForm, string>>>();

  const handleChange = (name: keyof ScheduleStackUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleStackFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      // 의뢰기관·사업장 필드를 비워 보내므로 서버 병합이 그 값들을 그대로 둔다.
      await changeClient(scheduleId, toStackSnapshotUpdate(form));
      toast.success("측정시설 정보가 수정되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return { form, fieldErrors, isLoading, handleChange, handleSubmit };
};
