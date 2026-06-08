import { useState } from "react";

import type { Company } from "@entities/company";
import { useRegisterWorkplaceAction } from "@entities/workplace";

import type { WorkplaceRegisterForm } from "../model/types";
import { getDefaultWorkplaceRegisterForm } from "../model/types";
import { toWorkplaceCreate } from "../model/mapper";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useRegisterWorkplace = ({ company, onSuccess }: Props) => {
  const { registerWorkplace, isLoading, error } = useRegisterWorkplaceAction({ onSuccess });

  const [form, setForm] = useState<WorkplaceRegisterForm>(getDefaultWorkplaceRegisterForm(company));

  const handleChange = (name: keyof WorkplaceRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await registerWorkplace(toWorkplaceCreate(form));
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  };
}