import { useState } from "react";

import type { WorkplaceRegisterForm } from "../types";
import { getDefaultWorkplaceRegisterForm } from "../types";
import { toWorkplaceCreate } from "../mapper";

import type { Client } from "@entities/client";
import { useRegisterWorkplaceAction } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";
import type { AddressValue } from "@shared/model";

interface Props {
  client: Client | null;
  onSuccess: () => void;
}

export const useRegisterWorkplace = ({ client, onSuccess }: Props) => {
  const { registerWorkplace, isLoading } = useRegisterWorkplaceAction();

  const [form, setForm] = useState<WorkplaceRegisterForm>(getDefaultWorkplaceRegisterForm(client));
  const [checked, setChecked] = useState(false);

  const handleChange = (name: keyof WorkplaceRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = ({ zipcode, roadAddress, detailAddress }: AddressValue) => {
    setForm((prev) => ({
      ...prev,
      workplaceZipcode: zipcode,
      workplaceRoadAddress: roadAddress,
      workplaceDetailAddress: detailAddress,
    }));
  };

  const copyClientInfo = () => {
    if (!client) return;

    if (!checked) {
      setForm((prev) => ({
        ...prev,
        workplaceName: client.name,
        workplaceBizNumber: client.bizNumber,
        workplaceZipcode: client.zipcode,
        workplaceRoadAddress: client.roadAddress,
        workplaceDetailAddress: client.detailAddress,
      }));
    } else {
      setForm(getDefaultWorkplaceRegisterForm(client));
    }
    setChecked(!checked);
  }

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerWorkplace(toWorkplaceCreate(form));
      toast.success("측정대상 사업장이 등록되었습니다.")
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    handleSubmit,
    handleChange,
    handleAddressChange,

    copyClientInfo,
    checked,
  };
}