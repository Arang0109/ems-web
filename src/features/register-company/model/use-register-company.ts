import { useState } from "react";

import { useRegisterCompanyAction } from "@entities/company";

import type { CompanyRegisterForm } from "../model/types";
import { getDefaultCompanyRegisterForm } from "../model/types";
import { toCompanyCreate } from "../model/mapper";

interface Props { onSuccess: () => void; }

export const useRegisterCompany = ({ onSuccess }: Props) => {
  const { registerCompany, isLoading, error } = useRegisterCompanyAction({ onSuccess });

  const [form, setForm] = useState<CompanyRegisterForm>(getDefaultCompanyRegisterForm());

  const handleChange = (name: keyof CompanyRegisterForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await registerCompany(toCompanyCreate(form));
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  }
}