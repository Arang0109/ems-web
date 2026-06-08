import { useState } from "react";

import type { CompanyRegisterForm } from "../types";
import { getDefaultForm } from "../types";
import { toCompanyCreate } from "../mapper";

import { useRegisterCompanyAction } from "@entities/company";

import { toast } from "@shared/ui/toasts";

interface Props { onSuccess: () => void; }

export const useRegisterCompany = ({ onSuccess }: Props) => {
  const { registerCompany, isLoading, error } = useRegisterCompanyAction();

  const [form, setForm] = useState<CompanyRegisterForm>(getDefaultForm());

  const handleChange = (name: keyof CompanyRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerCompany(toCompanyCreate(form));
      toast.success(`측정대행 의뢰기관이 등록되었습니다.`);
      setForm(getDefaultForm());
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
};
