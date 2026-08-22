import { useMemo, useState } from "react";

import { useChangeItemsAction } from "@entities/schedule";
import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { toast } from "@shared/ui/toasts";

import type { ScheduleItemsForm } from "../types";
import { toItemGroups } from "../options";
import { toScheduleItemsUpdate } from "../mapper";
import { validateScheduleItemsFields } from "../validator";

interface Props {
  scheduleId: number;
  /** 측정시설(원장)에 등록된 측정항목 — 선택 후보 */
  stackPollutants: StackPollutantListItem[];
  /** 이번 계획에 포함된 측정항목(스냅샷) — 초기 선택 상태 */
  items: MeasurementItemSnapshot[];
  onSuccess: () => void;
}

export const useUpdateScheduleItems = ({
  scheduleId, stackPollutants, items, onSuccess,
}: Props) => {
  const { changeItems, isLoading } = useChangeItemsAction();

  // 부모가 key로 리마운트하므로 prop은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<ScheduleItemsForm>({
    pollutantIds: items.map((item) => item.pollutantId),
  });
  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof ScheduleItemsForm, string>>>();

  const groups = useMemo(() => toItemGroups(stackPollutants, items), [stackPollutants, items]);

  const selectedIds = useMemo(() => new Set(form.pollutantIds), [form.pollutantIds]);

  const handleToggle = (pollutantId: number, checked: boolean) => {
    setForm((prev) => ({
      pollutantIds: checked
        ? [...prev.pollutantIds, pollutantId]
        : prev.pollutantIds.filter((id) => id !== pollutantId),
    }));
    setFieldErrors(undefined);
  };

  const handleToggleGroup = (cycle: string, checked: boolean) => {
    const group = groups.find((g) => g.cycle === cycle);
    if (!group) return;

    const ids = group.options.map((option) => option.pollutantId);
    setForm((prev) => ({
      pollutantIds: checked
        ? [...new Set([...prev.pollutantIds, ...ids])]
        : prev.pollutantIds.filter((id) => !ids.includes(id)),
    }));
    setFieldErrors(undefined);
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateScheduleItemsFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await changeItems(scheduleId, toScheduleItemsUpdate(form));
      toast.success("측정항목이 수정되었습니다.");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "수정에 실패했습니다.";
      toast.error(message);
    }
  };

  return { groups, selectedIds, fieldErrors, isLoading, handleToggle, handleToggleGroup, handleSubmit };
};
