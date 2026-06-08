import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useRegisterContractAction } from "@entities/contract";

import type { ContractRegisterForm } from "../model/types";
import { getDefaultContractForm } from "../model/types";
import { toContractCreate } from "../model/mapper";

export const useRegisterContract = () => {
  const navigate = useNavigate();

  const { registerContract, isLoading, error } = useRegisterContractAction({
    onSuccess: () => navigate('/contracts'),
  });

  const [form, setForm] = useState<ContractRegisterForm>(getDefaultContractForm());

  const handleChange = <K extends keyof ContractRegisterForm>(name: K, value: ContractRegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await registerContract(toContractCreate(form));
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  };
}