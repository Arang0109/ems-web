import { useState } from "react";

import type { EquipmentUpdateForm, EquipmentSpecForm } from "../types";
import { getDefaultForm } from "../types";
import { toEquipmentUpdate, toEquipmentStatusChange } from "../mapper";
import { validateEquipmentUpdateFields } from "../validator";

import { useUpdateEquipmentAction, useChangeEquipmentStatusAction } from "@entities/equipment";
import type { Equipment } from "@entities/equipment";

import { toast } from "@shared/ui/toasts";

interface Props {
  equipment: Equipment | null;
  onSuccess: () => void;
}

type SpecScalarField = 'totalVolume' | 'orificeDp' | 'yd' | 'pitotTubeType';

export const useUpdateEquipment = ({ equipment, onSuccess }: Props) => {
  const { updateEquipment, isLoading } = useUpdateEquipmentAction();
  const { changeEquipmentStatus } = useChangeEquipmentStatusAction();

  // prop 초기화는 key 리마운트로 처리 — prop은 useState 초기값으로만 사용한다.
  const [form, setForm] = useState<EquipmentUpdateForm>(getDefaultForm(equipment));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EquipmentUpdateForm, string>>>();

  const handleChange = (name: keyof EquipmentUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const setSpec = (updater: (spec: EquipmentSpecForm) => EquipmentSpecForm) => {
    setForm((prev) => ({ ...prev, spec: updater(prev.spec) }));
    setFieldErrors((prev) => ({ ...prev, spec: undefined }));
  };

  const handleSpecChange = (name: SpecScalarField, value: string) => {
    setSpec((spec) => ({ ...spec, [name]: value }));
  };

  const handleAddCoefficient = () => {
    setSpec((spec) => ({ ...spec, coefficients: [...spec.coefficients, { coefficient: '', velocity: '' }] }));
  };

  const handleRemoveCoefficient = (index: number) => {
    setSpec((spec) => ({ ...spec, coefficients: spec.coefficients.filter((_, i) => i !== index) }));
  };

  const handleCoefficientChange = (index: number, field: 'coefficient' | 'velocity', value: string) => {
    setSpec((spec) => ({
      ...spec,
      coefficients: spec.coefficients.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const handleAddDiameter = () => {
    setSpec((spec) => ({ ...spec, diameters: [...spec.diameters, { diameter: '' }] }));
  };

  const handleRemoveDiameter = (index: number) => {
    setSpec((spec) => ({ ...spec, diameters: spec.diameters.filter((_, i) => i !== index) }));
  };

  const handleDiameterChange = (index: number, value: string) => {
    setSpec((spec) => ({
      ...spec,
      diameters: spec.diameters.map((d, i) => (i === index ? { diameter: value } : d)),
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!equipment) return;

    const errors = validateEquipmentUpdateFields(equipment.type, form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updateEquipment(equipment.id, toEquipmentUpdate(equipment.type, form));
      // 상태가 바뀐 경우에만 별도 status 변경 API 호출
      if (form.status !== equipment.status) {
        await changeEquipmentStatus(equipment.id, toEquipmentStatusChange(form));
      }
      toast.success(`${equipment.equipmentName} 이(가) 수정되었습니다.`);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '수정에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    fieldErrors,

    handleChange,
    handleSpecChange,
    handleAddCoefficient,
    handleRemoveCoefficient,
    handleCoefficientChange,
    handleAddDiameter,
    handleRemoveDiameter,
    handleDiameterChange,

    handleSubmit,
  };
};
