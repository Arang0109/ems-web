import { useState } from 'react';

import { useUpdateFacilityAction } from '@entities/stack';
import type { Facility } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

import { getDefaultFacilityUpdateForm, type FacilityUpdateForm } from '../types';
import { toFacilityUpdate } from '../mapper';

interface Props {
  stackId: number;
  facility: Facility | null;
  onSuccess: () => void;
}

export const useUpdateFacility = ({ stackId, facility, onSuccess }: Props) => {
  const { updateFacility, isLoading } = useUpdateFacilityAction();
  const [form, setForm] = useState<FacilityUpdateForm>(getDefaultFacilityUpdateForm(facility ?? undefined));

  const handleChange = <K extends keyof FacilityUpdateForm>(name: K, value: FacilityUpdateForm[K]) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (!facility) return;
    e.preventDefault();
    try {
      await updateFacility(stackId, facility.id, toFacilityUpdate(form));
      toast.success(`${facility.name}이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수정에 실패했습니다.');
    }
  };

  return { form, isLoading, handleChange, handleSubmit };
};
