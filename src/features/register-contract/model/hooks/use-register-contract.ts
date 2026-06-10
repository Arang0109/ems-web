import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { ContractRegisterForm } from "../types";
import { getDefaultContractForm } from "../types";
import { toContractCreate, toWorkplaceOptions } from "../mapper";

import { useWorkplaces } from "@entities/workplace";
import { useRegisterContractAction } from "@entities/contract";

import { toast } from "@shared/ui/toasts";

export const useRegisterContract = () => {
  const { data: workplaces, fetchWorkplaces } = useWorkplaces();
  const navigate = useNavigate();

  const { registerContract, isLoading, error } = useRegisterContractAction();

  const [form, setForm] = useState<ContractRegisterForm>(getDefaultContractForm());

  const handleChange = <K extends keyof ContractRegisterForm>(name: K, value: ContractRegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchWorkplaces(null);
  }, [fetchWorkplaces])

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerContract(toContractCreate(form));
      toast.success("계약서가 등록되었습니다.");
      navigate('/contracts');
    } catch(err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  const workplaceOptions = useMemo(() => toWorkplaceOptions(workplaces), [workplaces]);

  const handleWorkplaceChange = (value: string) => {
    const selected = workplaces.find((wp) => String(wp.id) === value);

    handleChange("workplaceId", value);

    if (selected) {
      handleChange("workplaceName", selected.workplaceName);
      handleChange("workplaceAddress", selected.address ?? "");
    }
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
    handleWorkplaceChange,

    workplaceOptions,

  };
}