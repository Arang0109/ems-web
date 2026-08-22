import { useState } from "react";

import { useUpdateStackPollutantAction } from "@entities/stack-pollutant";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { toast } from "@shared/ui/toasts";

import { getDefaultStackPollutantUpdateForm, type StackPollutantUpdateForm } from "../types";
import { toStackPollutantUpdate } from "../mapper";

interface Props {
  item: StackPollutantListItem | null;
  /** 측정시설의 기준산소농도(%) — null 이면 항목별 산소보정 적용 여부를 묻지 않는다 */
  standardOxygen: number | null;
  onSuccess: () => void;
}

export const useUpdateStackPollutant = ({ item, standardOxygen, onSuccess }: Props) => {
  const { updateStackPollutant, isLoading } = useUpdateStackPollutantAction();

  // 부모가 key 로 리마운트하므로 prop 은 초기값으로만 쓴다(useEffect 동기화 금지).
  const [form, setForm] = useState<StackPollutantUpdateForm>(
    getDefaultStackPollutantUpdateForm(item),
  );

  const hasStandardOxygen = standardOxygen !== null;

  const handleChange = <K extends keyof StackPollutantUpdateForm>(
    name: K,
    value: StackPollutantUpdateForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!item) return;

    try {
      await updateStackPollutant(item.id, toStackPollutantUpdate(form, hasStandardOxygen));
      toast.success(`${item.pollutant.nameKr}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수정에 실패했습니다.');
    }
  };

  return { form, hasStandardOxygen, isLoading, handleChange, handleSubmit };
};
