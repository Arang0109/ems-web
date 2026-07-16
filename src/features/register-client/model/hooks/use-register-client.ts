import { useState } from "react";

import type { ClientRegisterForm } from "../types";
import { getDefaultForm } from "../types";
import { toClientCreate } from "../mapper";

import { useRegisterClientAction } from "@entities/client";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";
import { validateClientFields } from "../validator";

interface Props { onSuccess: () => void; }

export const useRegisterClient = ({ onSuccess }: Props) => {
  const { registerClient, isLoading } = useRegisterClientAction();

  const [form, setForm] = useState<ClientRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClientRegisterForm, string>>>();

  const handleChange = (name: keyof ClientRegisterForm, value: string) => {
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

    const errors = validateClientFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerClient(toClientCreate(form));
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

    fieldErrors,

    handleSubmit,
    handleChange,
    handleAddressChange,
  };
};
