import { useState } from 'react';

import { useUpdatePreventionAction } from '@entities/stack';
import type { Prevention } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

import { getDefaultPreventionUpdateForm, type PreventionUpdateForm } from '../types';
import { toPreventionUpdate } from '../mapper';

interface Props {
  stackId: number;
  prevention: Prevention | null;
  onSuccess: () => void;
}

export const useUpdatePrevention = ({ stackId, prevention, onSuccess }: Props) => {
  const { updatePrevention, isLoading } = useUpdatePreventionAction();
  const [form, setForm] = useState<PreventionUpdateForm>(getDefaultPreventionUpdateForm(prevention ?? undefined));

  const handleChange = <K extends keyof PreventionUpdateForm>(name: K, value: PreventionUpdateForm[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!prevention) return;
    e.preventDefault();
    try {
      await updatePrevention(stackId, prevention.id, toPreventionUpdate(form));
      toast.success(`${prevention.name}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수정에 실패했습니다.');
    }
  };

  return { form, isLoading, handleChange, handleSubmit };
};
