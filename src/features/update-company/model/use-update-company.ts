import { useState } from "react";

import { useUpdateCompanyAction } from "@entities/company";
import type { Company } from "@entities/company";

import type { CompanyUpdateForm } from "../model/types";
import { toCompanyUpdate } from "../model/mapper";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useUpdateCompany = ({ company, onSuccess }: Props) => {
  const { updateCompany, isLoading, error } = useUpdateCompanyAction({ onSuccess });

  const [form, setForm] = useState<CompanyUpdateForm>({
    name: company?.name ?? '',
    representative: company?.representative ?? '',
    address: company?.address ?? "",
    bizNumber: company?.bizNumber ?? "",
    manager: company?.manager ?? "",
    email: company?.email ?? "",
    tel: company?.tel ?? ""
  });

  const handleChange = (name: keyof CompanyUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!company) return
    e.preventDefault();
    await updateCompany(company.id, toCompanyUpdate(form));
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  }
}