import { useState } from "react";

import { useUpdateItemAction } from "@entities/schedule";
import type { MeasurementItemSnapshot } from "@entities/schedule";
import { useUpdateStackPollutantAction } from "@entities/stack-pollutant";
import { toFormValue } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import type { ScheduleItemUpdateForm } from "../types";
import { toScheduleItemUpdate, toStackPollutantUpdate } from "../mapper";
import { validateScheduleItemFields } from "../validator";

interface Props {
  scheduleId: number;
  /** 이 회차 문서에 담긴 측정항목(스냅샷) — 폼의 초기값 */
  item: MeasurementItemSnapshot;
  /**
   * 측정시설 원장에 남아 있는 같은 항목의 id. 원장에서 이미 삭제된 항목이면 null 이며,
   * 그 경우 원장 반영을 제안하지 않는다(수정할 원본이 없다).
   */
  stackPollutantId: number | null;
  onSuccess: () => void;
}

export const useUpdateScheduleItem = ({
  scheduleId, item, stackPollutantId, onSuccess,
}: Props) => {
  const { updateItem, isLoading: isItemLoading } = useUpdateItemAction();
  const { updateStackPollutant, isLoading: isStackLoading } = useUpdateStackPollutantAction();

  const canApplyToStack = stackPollutantId !== null;

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleItemUpdateForm>({
    cycle: item.cycle,
    allowance: toFormValue(item.allowance),
    oxygenApplicable: item.oxygenApplicable,
    applyToStack: canApplyToStack,
  });

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleItemUpdateForm, string>>>();

  const handleChange = <K extends keyof ScheduleItemUpdateForm>(
    name: K, value: ScheduleItemUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleItemFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // 이 회차 문서를 먼저 고친다 — 사용자가 지금 보고 있는 계획에 반영하는 것이 주 목적이고,
    // 원장 반영이 실패해도 계획은 정정된 채로 남는다(반대 순서면 원장만 바뀌고 계획은 옛 값이다).
    try {
      await updateItem(scheduleId, item.pollutantId, toScheduleItemUpdate(form));
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
      return;
    }

    if (form.applyToStack && stackPollutantId !== null) {
      try {
        await updateStackPollutant(stackPollutantId, toStackPollutantUpdate(form));
      } catch {
        // 계획은 이미 정정됐으므로 성공으로 닫되, 원장이 그대로라는 사실은 분명히 알린다.
        toast.error("측정계획은 정정했으나 측정지점 원장 반영에 실패했습니다. 측정지점에서 직접 수정해 주세요.");
        onSuccess();
        return;
      }
    }

    toast.success(
      form.applyToStack && canApplyToStack
        ? "측정항목을 정정하고 측정지점 원장에도 반영했습니다."
        : "측정항목이 정정되었습니다.",
    );
    onSuccess();
  };

  return {
    form,
    fieldErrors,
    canApplyToStack,
    isLoading: isItemLoading || isStackLoading,
    handleChange,
    handleSubmit,
  };
};
