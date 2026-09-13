import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { ContractRegisterForm } from "../types";
import { getDefaultContractForm } from "../types";
import { toContractCreate, toWorkplaceOptions } from "../mapper";

import { useWorkplaces } from "@entities/workplace";
import { useRegisterContractAction } from "@entities/contract";

import { toast } from "@shared/ui/toasts";

export const useRegisterContract = () => {
  // null 은 필터 없는 전체 목록이다 — 계약은 어느 사업장에도 붙을 수 있다.
  const { data: workplaces } = useWorkplaces(null);
  const navigate = useNavigate();

  const { registerContract, isLoading } = useRegisterContractAction();

  const [form, setForm] = useState<ContractRegisterForm>(getDefaultContractForm());

  const handleChange = <K extends keyof ContractRegisterForm>(name: K, value: ContractRegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
      handleChange("workplaceAddress", selected.roadAddress + " (" + selected.detailAddress + ")");
    }
  };

  return {
    form,
    isLoading,

    handleSubmit,
    handleChange,
    handleWorkplaceChange,

    workplaceOptions,

  };
}