import { useState } from 'react';

import { useRegisterFacilityAction } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

import { getDefaultFacilityRegisterForm } from '../types';
import { toFacilityCreate } from '../mapper';
import type { FacilityRegisterForm } from '../types';

interface Props {
  stackId: number;
  onSuccess: () => void;
}

export const useRegisterFacility = ({ stackId, onSuccess }: Props) => {
  const { registerFacility, isLoading } = useRegisterFacilityAction();
  const [form, setForm] = useState<FacilityRegisterForm>(getDefaultFacilityRegisterForm());

  const handleChange = <K extends keyof FacilityRegisterForm>(name: K, value: FacilityRegisterForm[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerFacility(toFacilityCreate(stackId, form));
      toast.success('배출시설이 등록되었습니다.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '등록에 실패했습니다.');
    }
  };

  return { form, isLoading, handleChange, handleSubmit };
};
