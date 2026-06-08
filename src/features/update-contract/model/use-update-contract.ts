import { useState } from "react";

import { useUpdateContractAction } from "@entities/contract";

import type { ContractUpdateForm } from "./types";
import { toContractUpdate } from "./mapper";

interface Props {
  contractId: number;
  initial: ContractUpdateForm;
  onSuccess?: () => void;
}

export const useUpdateContract = ({ contractId, initial, onSuccess }: Props) => {
  const { updateContract, isLoading, error } = useUpdateContractAction({
    onSuccess: onSuccess ?? (() => {}),
  });

  const [form, setForm] = useState<ContractUpdateForm>(initial);

  const handleChange = <K extends keyof ContractUpdateForm>(
    name: K,
    value: ContractUpdateForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateContract(contractId, toContractUpdate(form));
  };

  return { form, isLoading, error, handleChange, handleSubmit };
};
