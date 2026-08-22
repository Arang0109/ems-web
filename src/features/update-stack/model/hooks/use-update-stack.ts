import { useState } from "react";

import { useUpdateStackAction } from "@entities/stack";

import type { StackUpdateForm } from "../types";
import { toStackUpdate } from "../mapper";
import { validateStackFields } from "../validator";

import { toFormValue } from "@shared/lib";
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
    mainProduct: stack?.mainProduct ?? "",
    // 도메인이 number | null 이므로 String() 을 쓰면 null 이 "null" 로 새어 나온다.
    standardOxygen: toFormValue(stack?.standardOxygen),
    height: stack?.height ?? "",
    horizontalLength: stack?.horizontalLength ?? "",
    verticalLength: stack?.verticalLength ?? "",
    shape: stack?.shape ?? "CIRCULAR",
    orientation: stack?.orientation ?? "VERTICAL"
  });

  const [fieldErrors, setFieldErrors] =
    useState<Partial<Record<keyof StackUpdateForm, string>>>();

  const handleChange = (name: keyof StackUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!stack) return
    e.preventDefault();

    const errors = validateStackFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {

      console.log(form)
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
    fieldErrors,
    isLoading,

    handleChange,
    handleSubmit,
  }
}