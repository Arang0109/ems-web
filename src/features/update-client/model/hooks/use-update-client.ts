import { useState } from "react";

import type { ClientUpdateForm } from "../types";
import { toClientUpdate } from "../mapper";

import { useUpdateClientAction } from "@entities/client";
import type { Client } from "@entities/client";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";

interface Props {
  client: Client | null;
  onSuccess: () => void;
}

export const useUpdateClient = ({ client, onSuccess }: Props) => {
  const { updateClient, isLoading, error } = useUpdateClientAction();

  const [form, setForm] = useState<ClientUpdateForm>({
    name: client?.name ?? '',
    representative: client?.representative ?? '',
    zipcode: client?.zipcode ?? '',
    roadAddress: client?.roadAddress ?? '',
    address: client?.address ?? "",
    bizNumber: client?.bizNumber ?? "",
    manager: client?.manager ?? "",
    email: client?.email ?? "",
    tel: client?.tel ?? ""
  });

  const handleChange = (name: keyof ClientUpdateForm, value: string) => {
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
    if (!client) return
    e.preventDefault();
    
    try {
      await updateClient(client.id, toClientUpdate(form));
      toast.success(`${client.name} 이/가 수정되었습니다.`);
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
    handleAddressChange,
  }
}