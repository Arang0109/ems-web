import { useState } from 'react';

import { useRegisterSubstanceAction } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

import { getDefaultSubstanceRegisterForm, type SubstanceRegisterForm } from '../types';
import { toSubstanceCreate } from '../mapper';

interface Props {
  stackId: number;
  preventionId: number;
  onSuccess: () => void;
}

export const useRegisterSubstance = ({ stackId, preventionId, onSuccess }: Props) => {
  const { registerSubstance, isLoading } = useRegisterSubstanceAction();
  const [form, setForm] = useState<SubstanceRegisterForm>(getDefaultSubstanceRegisterForm());

  const handleChange = <K extends keyof SubstanceRegisterForm>(name: K, value: SubstanceRegisterForm[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await registerSubstance(stackId, preventionId, toSubstanceCreate(form));
      toast.success('대상물질이 등록되었습니다.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '등록에 실패했습니다.');
    }
  };

  return { form, isLoading, handleChange, handleSubmit };
};
