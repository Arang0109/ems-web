import { useState } from "react";

import { useRegisterPollutantAction } from "@entities/pollutant"

import { getDefaultForm } from "../types";
import type { PollutantRegisterForm } from "../types";
import { toPollutantCreate } from "../mapper";

import { toast } from "@shared/ui/toasts";

interface Props {
  onSuccess: () => void;
}

export const useRegisterPollutant = ({ onSuccess }: Props) => {
  const { registerPollutant, loading, error } = useRegisterPollutantAction();

  const [form, setForm] = useState<PollutantRegisterForm>(getDefaultForm());

  const handleChange = <K extends keyof PollutantRegisterForm>(name: K, value: PollutantRegisterForm[K]) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerPollutant(toPollutantCreate(form));
      toast.success("측정물질이 등록되었습니다.");
      onSuccess();
    } catch(err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  }

  return {
    form,

    handleSubmit,
    handleChange,

    loading, error
  }
}