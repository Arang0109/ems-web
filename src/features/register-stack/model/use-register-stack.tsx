import { useState  } from "react";

import type { Workplace } from "@entities/workplace";
import { stackApi } from "@entities/stack";

import type { StackRegisterForm } from "../model/types";
import { getDefaultStackRegisterForm } from "../model/types";
import { mapToDto } from "../model/mapper";

interface useRegisterStackProps {
  workplace: Workplace | null;
  
  onSuccess: () => void;
}

export const useRegisterStack = ({
  workplace,

  onSuccess,
}: useRegisterStackProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<StackRegisterForm>(getDefaultStackRegisterForm(workplace));

  const handleChange = <K extends keyof StackRegisterForm>(
    name: K,
    value: StackRegisterForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log(form)
    const payload = mapToDto(form);

    try {
      const res = await stackApi.registerStack(payload);
      onSuccess();
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally { setIsLoading(false); }
  };

  return {
    form,
    isLoading,
    error,

    onSubmit,
    handleChange,
  }
}