import { useState } from "react";

import { companyApi } from "@entities/company";

import type { CompanyRegisterForm } from "../model/types";
import { getDefaultCompanyRegisterForm } from "../model/types";
import { mapToDto } from "../model/mapper";

interface useRegisterCompanyProps {
  onSuccess: () => void;
}

export const useRegisterCompany = ({
  onSuccess
}: useRegisterCompanyProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CompanyRegisterForm>(getDefaultCompanyRegisterForm());

  const handleChange = (name: keyof CompanyRegisterForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = mapToDto(form);

    try {
      const res = await companyApi.registerCompany(payload);
      onSuccess();
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