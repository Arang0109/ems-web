import { useState } from "react";

import type { CompanyRegisterForm } from "@entities/company";
import { getDefaultCompanyRegisterForm } from "@entities/company";

export const useRegisterCompany = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<CompanyRegisterForm>(getDefaultCompanyRegisterForm());

  const handleChange = (name: keyof CompanyRegisterForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = () => {
    setIsLoading(true);

    console.log(form);

    setIsLoading(false);
  }

  return {
    form,
    onSubmit,
    handleChange,
    isLoading,
  }
}