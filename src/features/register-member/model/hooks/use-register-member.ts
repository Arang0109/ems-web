import { useState } from "react";

import type { MemberRegisterForm } from "../types";
import { getDefaultForm } from "../types";
import { toMemberCreate } from "../mapper";
import { validateMemberFields } from "../validator";

import { useRegisterMemberAction, useRoles } from "@entities/member";

import { toast } from "@shared/ui/toasts";
import type { SelectOption } from "@shared/ui/form";

interface Props { onSuccess: () => void; }

export const useRegisterMember = ({ onSuccess }: Props) => {
  const { registerMember, isLoading } = useRegisterMemberAction();
  const { data: roles } = useRoles();

  const [form, setForm] = useState<MemberRegisterForm>(getDefaultForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof MemberRegisterForm, string>>>();

  const roleOptions: SelectOption[] = roles.map((role) => ({
    value: String(role.roleId),
    label: role.description,
  }));

  const handleChange = (name: keyof MemberRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateMemberFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerMember(toMemberCreate(form));
      toast.success(`회원이 등록되었습니다.`);
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
    roleOptions,

    handleSubmit,
    handleChange,
  };
};
