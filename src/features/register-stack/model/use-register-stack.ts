import { useState } from "react";

import type { Workplace } from "@entities/workplace";
import { useRegisterStackAction } from "@entities/stack";

import type { StackRegisterForm } from "../model/types";
import { getDefaultStackRegisterForm } from "../model/types";
import { toStackCreate } from "../model/mapper";

interface Props {
  workplace: Workplace | null;
  onSuccess: () => void;
}

export const useRegisterStack = ({ workplace, onSuccess }: Props) => {
  const { registerStack, isLoading, error } = useRegisterStackAction({ onSuccess });

  const [form, setForm] = useState<StackRegisterForm>(getDefaultStackRegisterForm(workplace));

  const handleChange = <K extends keyof StackRegisterForm>(
    name: K,
    value: StackRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await registerStack(toStackCreate(form));
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  };
}
