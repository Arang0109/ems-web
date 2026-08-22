import { useState } from "react";

import type { WorkplaceUpdateForm } from "../types";
import { toWorkplaceUpdate } from "../mapper";

import { useUpdateWorkplaceAction } from "@entities/workplace";
import type { Workplace } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";

interface Props {
  workplace: Workplace | null;
  onSuccess: () => void;
}

export const useUpdateWorkplace = ({ workplace, onSuccess }: Props) => {
  const { updateWorkplace, isLoading } = useUpdateWorkplaceAction();

  const [form, setForm] = useState<WorkplaceUpdateForm>({
    name: workplace?.name ?? '',
    bizNumber: workplace?.bizNumber ?? "",
    businessCategory: workplace?.businessCategory ?? "",
    zipcode: workplace?.zipcode ?? '',
    roadAddress: workplace?.roadAddress ?? '',
    address: workplace?.detailAddress ?? "",
    facilityManager: workplace?.facilityManager ?? "",
    samplingWitness: workplace?.samplingWitness ?? "",
    grade: workplace?.grade ?? "TYPE_1",
  });

  const handleChange = (name: keyof WorkplaceUpdateForm, value: string) => {
    setForm((prev) => ({...prev, [name]: value,}));
  };

  const handleAddressChange = ({ zipcode, roadAddress, detailAddress }: AddressValue) => {
    setForm((prev) => ({
      ...prev,
      zipcode: zipcode,
      roadAddress,
      address: detailAddress,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    if (!workplace) return
    e.preventDefault();
    
    try {
      await updateWorkplace(workplace.id, toWorkplaceUpdate(form));
      toast.success(`${workplace.name}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    handleSubmit,
    handleChange,
    handleAddressChange,
  }
}