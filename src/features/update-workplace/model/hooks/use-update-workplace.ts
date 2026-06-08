import { useState } from "react";

import type { WorkplaceUpdateForm } from "../types";
import { toWorkplaceUpdate } from "../mapper";

import { useUpdateWorkplaceAction } from "@entities/workplace";
import type { WorkplaceListItem } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";

interface Props {
  workplace: WorkplaceListItem | null;
  onSuccess: () => void;
}

export const useUpdateWorkplace = ({ workplace, onSuccess }: Props) => {
  const { updateWorkplace, isLoading, error } = useUpdateWorkplaceAction();

  const [form, setForm] = useState<WorkplaceUpdateForm>({
    name: workplace?.workplaceName ?? '',
    bizNumber: workplace?.bizNumber ?? "",
    address: workplace?.address ?? "",
  });

  const handleChange = (name: keyof WorkplaceUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!workplace) return
    e.preventDefault();
    
    try {
      await updateWorkplace(workplace.id, toWorkplaceUpdate(form));
      toast.success(`${workplace.workplaceName}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,
    error,

    handleSubmit,
    handleChange,
  }
}