import { useState } from "react";

import { contractApi } from "@entities/contract";

import type { ContractEditForm } from "./types";
import { mapToUpdateDto } from "./mapper";

export const useUpdateContract = (
  contractId: number,
  initial: ContractEditForm,
  onSuccess?: () => void
) => {
  const [form, setForm] = useState<ContractEditForm>(initial);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = <K extends keyof ContractEditForm>(
    name: K,
    value: ContractEditForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await contractApi.updateContract(contractId, mapToUpdateDto(form));
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, error, handleChange, onSubmit };
};
