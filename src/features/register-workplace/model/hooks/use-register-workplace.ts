import { useState } from "react";

import type { WorkplaceRegisterForm } from "../types";
import { getDefaultWorkplaceRegisterForm } from "../types";
import { toWorkplaceCreate } from "../mapper";

import type { Company } from "@entities/company";
import { useRegisterWorkplaceAction } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useRegisterWorkplace = ({ company, onSuccess }: Props) => {
  const { registerWorkplace, isLoading, error } = useRegisterWorkplaceAction();

  const [form, setForm] = useState<WorkplaceRegisterForm>(getDefaultWorkplaceRegisterForm(company));

  const handleChange = (name: keyof WorkplaceRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerWorkplace(toWorkplaceCreate(form));
      toast.success("측정대상 사업장이 등록되었습니다.")
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  };
}