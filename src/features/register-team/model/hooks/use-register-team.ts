import { useState } from "react";

import type { TeamRegisterForm } from "../types";
import { getDefaultTeamRegisterForm } from "../types";
import { toTeamCreate } from "../mapper";
import { validateTeamFields } from "../validator";
import { useTeamFormOptions } from "./use-team-form-options";

import { useRegisterTeamAction } from "@entities/team";

import { toast } from "@shared/ui/toasts";

interface Props { onSuccess: () => void; }

export const useRegisterTeam = ({ onSuccess }: Props) => {
  const { registerTeam, isLoading } = useRegisterTeamAction();
  const options = useTeamFormOptions();

  const [form, setForm] = useState<TeamRegisterForm>(getDefaultTeamRegisterForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TeamRegisterForm, string>>>();

  const handleChange = (name: keyof TeamRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateTeamFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    try {
      await registerTeam(toTeamCreate(form));
      toast.success('팀이 등록되었습니다.');
      setForm(getDefaultTeamRegisterForm());
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
    ...options,

    handleChange,
    handleSubmit,
  };
};
