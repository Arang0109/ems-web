import { useState } from "react";

import type { TenantProvisionForm } from "../types";
import { getDefaultForm } from "../types";
import { toTenantProvision } from "../mapper";
import { validateTenantFields } from "../validator";

import {
  useProvisionTenantAction,
  SUBSCRIPTION_PLAN_OPTIONS,
  SUBSCRIPTION_PLAN_LABEL,
} from "@entities/tenant";

import { toast } from "@shared/ui/toasts";
import type { SelectOption } from "@shared/ui/form";

interface Props { onSuccess: () => void; }

export const useProvisionTenant = ({ onSuccess }: Props) => {
  const { provisionTenant, isLoading } = useProvisionTenantAction();

  const [form, setForm] = useState<TenantProvisionForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TenantProvisionForm, string>>>();

  const planOptions: SelectOption[] = SUBSCRIPTION_PLAN_OPTIONS.map((value) => ({
    value,
    label: SUBSCRIPTION_PLAN_LABEL[value],
  }));

  const handleChange = (name: keyof TenantProvisionForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateTenantFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await provisionTenant(toTenantProvision(form));
      toast.success(`고객사가 발급되었습니다.`);
      setForm(getDefaultForm());
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '발급에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    fieldErrors,
    planOptions,

    handleSubmit,
    handleChange,
  };
};
