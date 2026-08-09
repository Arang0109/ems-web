import { useState } from "react";

import type { FormRow } from "../types";
import { getDefaultRow } from "../types";
import { toStackPollutantCreates } from "../mapper";

import { useRegisterStackPollutantAction } from "@entities/stack-pollutant";

import { toast } from "@shared/ui/toasts";

interface Props {
  stackId: number | null;
  onSuccess: () => void;
}

export const useRegisterStackPollutant = ({ stackId, onSuccess }: Props) => {
  const { registerStackPollutants, isLoading } = useRegisterStackPollutantAction();

  const [rows, setRows] = useState<FormRow[]>([getDefaultRow()]);

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
    try {
      await registerStackPollutants(toStackPollutantCreates(stackId, rows));
      toast.success(`측정항목 ${rows.length}개가 등록되었습니다.`);
      setRows([getDefaultRow()]);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    rows,
    isLoading,
    handleAddRow,
    handleRemoveRow,
    handleChange,
    handleSubmit,
  };
};
