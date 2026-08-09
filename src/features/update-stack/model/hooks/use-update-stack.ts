import { useState } from "react";

import { useUpdateStackAction } from "@entities/stack";

import type { StackUpdateForm } from "../types";
import { toStackUpdate } from "../mapper";

import { toast } from "@shared/ui/toasts";
import type { Stack } from "@entities/stack";

interface Props {
  stack: Stack | null;
  onSuccess: () => void;
}

export const useUpdateStack = ({ stack, onSuccess }: Props) => {
  const { updateStack, isLoading } = useUpdateStackAction();

  const [form, setForm] = useState<StackUpdateForm>({
    field: stack?.field ?? "AIR",
    name: stack?.name ?? "",
    semsNumber: stack?.semsNumber ?? "",
    grade: stack?.grade ?? "TYPE_1",
    businessCategory: stack?.businessCategory ?? "",
    mainProduct: stack?.mainProduct ?? "",
    height: stack?.height ?? "",
    horizontalLength: stack?.horizontalLength ?? "",
    verticalLength: stack?.verticalLength ?? "",
    shape: stack?.shape ?? "CIRCULAR",
    orientation: stack?.orientation ?? "VERTICAL"
  });

  const handleChange = (name: keyof StackUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!stack) return
    e.preventDefault();
    
    try {
      await updateStack(stack.id, toStackUpdate(form));
      toast.success(`${stack.name}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    handleChange,
    handleSubmit,
  }
}