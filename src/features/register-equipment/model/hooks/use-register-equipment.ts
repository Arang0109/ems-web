import { useState } from "react";

import type { EquipmentRegisterForm, EquipmentSpecForm, InspectionItemForm } from "../types";
import { getDefaultEquipmentRegisterForm, getDefaultSpecForm, isEquipmentFormDirty } from "../types";
import { toEquipmentCreate } from "../mapper";
import { STEP_VALIDATORS, validateEquipmentFields } from "../validator";
import type { EquipmentStepId } from "../step-progress";

import { useRegisterEquipmentAction } from "@entities/equipment";

import type { EquipType } from "@shared/model";
import { toast } from "@shared/ui/toasts";

interface Props {
  defaultType?: EquipType | '';
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
  const handleTypeChange = (type: EquipType | '') => {
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

  /**
   * 위저드의 '다음' 이 쓰는 스텝 단위 검증.
   * 실패한 스텝의 에러만 채우고 이동을 막는다 (제출 시 전체 검증은 그대로 남는다).
   */
  const validateStep = (id: EquipmentStepId): boolean => {
    const errors = STEP_VALIDATORS[id](form);
    if (Object.keys(errors).length === 0) return true;

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return false;
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
    // Select·DatePicker·Checkbox 위주라 모달의 input 기반 판정으로는 부족하다.
    isDirty: isEquipmentFormDirty(form, defaultType),

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

    validateStep,
    handleSubmit,
  };
};
