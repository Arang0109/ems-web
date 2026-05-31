import { useState  } from "react";

import type { Company } from "@entities/company";
import { workplaceApi } from "@entities/workplace";

import type { WorkplaceRegisterForm } from "../model/types";
import { getDefaultWorkplaceRegisterForm } from "../model/types";
import { mapToDto } from "../model/mapper";

interface useRegisterWorkplaceProps {
  company: Company | null;
  
  onSuccess: () => void;
}

export const useRegisterWorkplace = ({
  company,

  onSuccess,
}: useRegisterWorkplaceProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<WorkplaceRegisterForm>(getDefaultWorkplaceRegisterForm(company));

  const handleChange = (name: keyof WorkplaceRegisterForm, value: string) => {
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
      const res = await workplaceApi.registerWorkplace(payload);
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