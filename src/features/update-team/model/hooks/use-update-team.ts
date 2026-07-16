import { useState } from "react";

import type { TeamUpdateForm } from "../types";
import { getDefaultForm } from "../types";
import { toTeamUpdate } from "../mapper";
import { validateTeamUpdateFields } from "../validator";
import { useTeamFormOptions } from "./use-team-form-options";

import { useUpdateTeamAction } from "@entities/team";
import type { Team } from "@entities/team";

import { toast } from "@shared/ui/toasts";

interface Props {
  team: Team | null;
  onSuccess: () => void;
}

export const useUpdateTeam = ({ team, onSuccess }: Props) => {
  const { updateTeam, isLoading } = useUpdateTeamAction();
  const options = useTeamFormOptions();

  // prop 초기화는 key 리마운트로 처리 — prop은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<TeamUpdateForm>(getDefaultForm(team));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TeamUpdateForm, string>>>();

  const handleChange = (name: keyof TeamUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!team) return;

    const errors = validateTeamUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updateTeam(team.id, toTeamUpdate(form));
      toast.success(`${team.name} 팀이 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
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
