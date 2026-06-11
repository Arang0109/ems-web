import { useState } from "react";

import type { CompanyRegisterForm } from "../types";
import { getDefaultForm } from "../types";
import { toCompanyCreate } from "../mapper";

import { useRegisterCompanyAction } from "@entities/company";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";
import { validateCompanyFields } from "../validator";

interface Props { onSuccess: () => void; }

export const useRegisterCompany = ({ onSuccess }: Props) => {
  const { registerCompany, isLoading, error } = useRegisterCompanyAction();

  const [form, setForm] = useState<CompanyRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CompanyRegisterForm, string>>>();

  const handleChange = (name: keyof CompanyRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));

    setFieldErrors((prev) => ({
    ...prev,
    [name]: undefined,
  }));
  };

  const handleAddressChange = ({ zipcode, roadAddress, detailAddress }: AddressValue) => {
    setForm((prev) => ({
      ...prev,
      zipcode: zipcode,
      roadAddress,
      address: detailAddress,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateCompanyFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

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

    fieldErrors,

    handleSubmit,
    handleChange,
    handleAddressChange,
  };
};
