import { useState } from "react";

import { contractApi } from "@entities/contract";

import type { ContractRegisterForm } from "../model/types";
import { getDefaultContractForm } from "../model/types";
import { mapToDto } from "../model/mapper";

export const useRegisterContract = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ContractRegisterForm>(getDefaultContractForm());

  const handleChange = <K extends keyof ContractRegisterForm>(name: K, value: ContractRegisterForm[K]) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async () => {
    setIsLoading(true);
    setError('');

    const payload = mapToDto(form);

    try {
      const res = await contractApi.registerContract(payload);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally { setIsLoading(false); }
  };

  return {
    form,
    isLoading,
    error,

    onSubmit,
    handleChange,
  }
}