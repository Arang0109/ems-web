import { useState } from "react";

import type { EquipmentRegisterForm, EquipmentSpecForm, InspectionItemForm } from "../types";
import { getDefaultEquipmentRegisterForm, getDefaultSpecForm } from "../types";
import { toEquipmentCreate } from "../mapper";
import { validateEquipmentFields } from "../validator";

import { useRegisterEquipmentAction } from "@entities/equipment";

import { toast } from "@shared/ui/toasts";

interface Props {
  defaultType?: string;
  onSuccess: () => void;
}

// 스칼라 spec 필드(리스트 제외)
type SpecScalarField = 'totalVolume' | 'orificeDp' | 'yd' | 'pitotTubeType';

export const useRegisterEquipment = ({ defaultType = '', onSuccess }: Props) => {
  const { registerEquipment, isLoading } = useRegisterEquipmentAction();

  const [form, setForm] = useState<EquipmentRegisterForm>(getDefaultEquipmentRegisterForm(defaultType));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EquipmentRegisterForm, string>>>();

  const handleChange = (name: keyof EquipmentRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // 종류 변경 시 spec을 초기화한다.
  const handleTypeChange = (type: string) => {
    setForm((prev) => ({ ...prev, type, spec: getDefaultSpecForm() }));
    setFieldErrors((prev) => ({ ...prev, type: undefined, spec: undefined }));
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

  const handleInspectionChange = (
    index: number,
    field: keyof InspectionItemForm,
    value: string | boolean,
  ) => {
    setForm((prev) => ({
      ...prev,
      inspections: prev.inspections.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
    setFieldErrors((prev) => ({ ...prev, inspections: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateEquipmentFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerEquipment(toEquipmentCreate(form));
      toast.success('측정장비가 등록되었습니다.');
      setForm(getDefaultEquipmentRegisterForm(defaultType));
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    isLoading,

    fieldErrors,

    handleChange,
    handleTypeChange,
    handleSpecChange,

    handleAddCoefficient,
    handleRemoveCoefficient,
    handleCoefficientChange,

    handleAddDiameter,
    handleRemoveDiameter,
    handleDiameterChange,

    handleInspectionChange,

    handleSubmit,
  };
};
