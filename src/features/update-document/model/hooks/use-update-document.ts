import { useState } from "react";

import { useUpdateDocumentAction } from "@entities/document";
import type { Document } from "@entities/document";

import { toast } from "@shared/ui/toasts";

import type { DocumentUpdateForm } from "../types";
import { toDocumentUpdate } from "../mapper";
import { validateDocumentUpdateFields } from "../validator";

interface Props {
  document: Document | null;
  onSuccess: () => void;
}

export const useUpdateDocument = ({ document, onSuccess }: Props) => {
  const { updateDocument, isLoading } = useUpdateDocumentAction();

  // 초기값 재적용은 부모의 key 리마운트로 처리한다(useEffect 동기화 금지).
  const [form, setForm] = useState<DocumentUpdateForm>({
    name: document?.name ?? '',
    category: document?.category ?? '',
    description: document?.description ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DocumentUpdateForm, string>>>();

  const handleChange = (name: keyof DocumentUpdateForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!document) return;

    const errors = validateDocumentUpdateFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await updateDocument(document.id, toDocumentUpdate(form));
      toast.success(`${form.name} 문서가 수정되었습니다.`);
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
    handleSubmit,
  };
};
