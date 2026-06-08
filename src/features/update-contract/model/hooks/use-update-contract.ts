import { useState } from "react";

import type { ContractUpdateForm } from "../types";
import { toContractUpdate } from "../mapper";

import { useUpdateContractAction } from "@entities/contract";

import { toast } from "@shared/ui/toasts";

interface Props {
  contractId: number;
  initial: ContractUpdateForm;
  onSuccess?: () => void;
}

export const useUpdateContract = ({ contractId, initial, onSuccess }: Props) => {
  const { updateContract, isLoading, error } = useUpdateContractAction();

  const [form, setForm] = useState<ContractUpdateForm>(initial);

  const handleChange = <K extends keyof ContractUpdateForm>(
    name: K,
    value: ContractUpdateForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await updateContract(contractId, toContractUpdate(form));
      toast.success(`${form.contractName}이(가) 수정되었습니다.`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return { form, isLoading, error, handleChange, handleSubmit };
};
