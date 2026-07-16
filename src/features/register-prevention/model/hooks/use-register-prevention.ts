import { useState } from 'react';

import { useRegisterPreventionAction } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

import { getDefaultPreventionRegisterForm, type PreventionRegisterForm } from '../types';
import { toPreventionCreate } from '../mapper';

interface Props {
  stackId: number;
  onSuccess: () => void;
}

export const useRegisterPrevention = ({ stackId, onSuccess }: Props) => {
  const { registerPrevention, isLoading } = useRegisterPreventionAction();
  const [form, setForm] = useState<PreventionRegisterForm>(getDefaultPreventionRegisterForm());

  const handleChange = <K extends keyof PreventionRegisterForm>(name: K, value: PreventionRegisterForm[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerPrevention(toPreventionCreate(stackId, form));
      toast.success('방지시설이 등록되었습니다.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '등록에 실패했습니다.');
    }
  };

  return { form, isLoading, handleChange, handleSubmit };
};
