import { useState } from "react";

import type { CompanyUpdateForm } from "../types";
import { toCompanyUpdate } from "../mapper";

import { useUpdateCompanyAction } from "@entities/company";
import type { Company } from "@entities/company";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";

interface Props {
  company: Company | null;
  onSuccess: () => void;
}

export const useUpdateCompany = ({ company, onSuccess }: Props) => {
  const { updateCompany, isLoading, error } = useUpdateCompanyAction();

  const [form, setForm] = useState<CompanyUpdateForm>({
    name: company?.name ?? '',
    representative: company?.representative ?? '',
    zipcode: company?.zipcode ?? '',
    roadAddress: company?.roadAddress ?? '',
    address: company?.address ?? "",
    bizNumber: company?.bizNumber ?? "",
    manager: company?.manager ?? "",
    email: company?.email ?? "",
    tel: company?.tel ?? ""
  });

  const handleChange = (name: keyof CompanyUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
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
    if (!company) return
    e.preventDefault();
    
    try {
      await updateCompany(company.id, toCompanyUpdate(form));
      toast.success(`${company.name} 이/가 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
    handleAddressChange,
  }
}