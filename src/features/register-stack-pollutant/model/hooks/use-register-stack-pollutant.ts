import { useState } from "react";

import type { FormRow } from "../types";
import { getDefaultRow } from "../types";
import { toStackPollutantCreates } from "../mapper";

import { useRegisterStackPollutantAction } from "@entities/stack-pollutant";

import { toast } from "@shared/ui/toasts";

interface Props {
  stackId: number | null;
  /** 측정시설의 기준산소농도(%) — null 이면 항목별 산소보정 적용 여부를 묻지 않는다 */
  standardOxygen: number | null;
  onSuccess: () => void;
}

export const useRegisterStackPollutant = ({ stackId, standardOxygen, onSuccess }: Props) => {
  const { registerStackPollutants, isLoading } = useRegisterStackPollutantAction();

  const [rows, setRows] = useState<FormRow[]>([getDefaultRow()]);

  const hasStandardOxygen = standardOxygen !== null;

  const handleAddRow = () => {
    setRows((prev) => [...prev, getDefaultRow()]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = <K extends keyof FormRow>(
    index: number,
    name: K,
    value: FormRow[K],
  ) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stackId) return;

    // 물질을 고르지 않은 행은 mapper 가 빼므로, 보낼 것이 없으면 요청 자체를 막는다.
    const items = toStackPollutantCreates(stackId, rows, hasStandardOxygen);
    if (items.length === 0) {
      toast.error('측정물질을 선택해주세요.');
      return;
    }

    try {
      await registerStackPollutants(items);
      toast.success(`측정항목 ${items.length}개가 등록되었습니다.`);
      setRows([getDefaultRow()]);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    rows,
    hasStandardOxygen,
    isLoading,
    handleAddRow,
    handleRemoveRow,
    handleChange,
    handleSubmit,
  };
};
