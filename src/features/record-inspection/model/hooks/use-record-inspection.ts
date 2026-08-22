import { useState } from "react";

import type { InspectionRecordForm } from "../types";
import { getDefaultInspectionRecordForm } from "../types";
import { toInspectionRecordCreate } from "../mapper";
import { validateInspectionRecordFields } from "../validator";

import { useInspectionRecords, useRecordInspectionAction } from "@entities/equipment";
import type { InspectionType } from "@shared/model";

import { toast } from "@shared/ui/toasts";

interface Props {
  equipmentId: string | null;
  type: InspectionType;
  /** 장비 상세를 다시 읽어 최종 수검일·다음 예정일을 갱신한다. */
  onSuccess?: () => void;
}

export const useRecordInspection = ({ equipmentId, type, onSuccess }: Props) => {
  const { data: records, loading, refetch } = useInspectionRecords({ equipmentId });
  const { recordInspection, isLoading } = useRecordInspectionAction();

  const [form, setForm] = useState<InspectionRecordForm>(getDefaultInspectionRecordForm(type));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof InspectionRecordForm, string>>>();

  // 이 종류의 이력만 보여준다. 서버는 장비의 전 종류 이력을 한 번에 내려준다.
  const typeRecords = records.filter((record) => record.type === type);

  const handleChange = (name: keyof InspectionRecordForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!equipmentId) return;

    const errors = validateInspectionRecordFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await recordInspection(equipmentId, toInspectionRecordCreate(form));
      toast.success('검사 실시 이력이 등록되었습니다.');
      setForm(getDefaultInspectionRecordForm(type));
      refetch();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '검사 이력 등록에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    form,
    records: typeRecords,
    loading,
    isLoading,

    fieldErrors,

    handleChange,
    handleSubmit,
  };
};
