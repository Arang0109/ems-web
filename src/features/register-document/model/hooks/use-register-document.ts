import { useState } from "react";

import { useRegisterDocumentAction } from "@entities/document";

import type { DocumentCategory } from "@shared/model";
import { toast } from "@shared/ui/toasts";

import type { DocumentRegisterForm } from "../types";
import { getDefaultDocumentRegisterForm } from "../types";
import { toDocumentCreate } from "../mapper";
import { validateDocumentFields } from "../validator";

interface Props {
  defaultCategory?: DocumentCategory | '';
  onSuccess: () => void;
}

export const useRegisterDocument = ({ defaultCategory = '', onSuccess }: Props) => {
  const { registerDocument, isLoading } = useRegisterDocumentAction();

  const [form, setForm] = useState<DocumentRegisterForm>(
    getDefaultDocumentRegisterForm(defaultCategory),
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DocumentRegisterForm, string>>>();

  const handleChange = (name: keyof DocumentRegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // 파일은 값 타입이 달라 별도 핸들러로 분리한다.
  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, file }));
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = validateDocumentFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await registerDocument(toDocumentCreate(form));
      toast.success('문서가 등록되었습니다.');
      setForm(getDefaultDocumentRegisterForm(defaultCategory));
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
    handleFileChange,
    handleSubmit,
  };
};
