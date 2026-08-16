import { useState } from "react";

import type { StackRegisterForm } from "../types";
import { getDefaultStackRegisterForm } from "../types";
import { toStackCreate } from "../mapper";
import { validateStackFields } from "../validator";

import type { Workplace } from "@entities/workplace";
import { useRegisterStackAction } from "@entities/stack";

import { toast } from "@shared/ui/toasts";

interface Props {
  workplace: Workplace | null;
  onSuccess: () => void;
}

export const useRegisterStack = ({ workplace, onSuccess }: Props) => {
  const { registerStack, isLoading } = useRegisterStackAction();

  const [form, setForm] = useState<StackRegisterForm>(getDefaultStackRegisterForm(workplace));
  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof StackRegisterForm, string>>>();

  const handleChange = <K extends keyof StackRegisterForm>(
    name: K,
    value: StackRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateStackFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerStack(toStackCreate(form));
      toast.success("측정시설이 등록되었습니다.")
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    fieldErrors,
    isLoading,

    handleSubmit,
    handleChange,
  };
}
