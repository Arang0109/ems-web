import { useState } from "react";

import { useAddDocumentVersionAction } from "@entities/document";

import { toast } from "@shared/ui/toasts";

import type { DocumentVersionForm } from "../types";
import { getDefaultDocumentVersionForm } from "../types";
import { toDocumentVersionCreate } from "../mapper";
import { validateDocumentVersionFields } from "../validator";

interface Props {
  documentId: number | null;
  onSuccess: () => void;
}

export const useAddDocumentVersion = ({ documentId, onSuccess }: Props) => {
  const { addDocumentVersion, isLoading } = useAddDocumentVersionAction();

  const [form, setForm] = useState<DocumentVersionForm>(getDefaultDocumentVersionForm());
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof DocumentVersionForm, string>>>();

  const handleChange = (name: keyof DocumentVersionForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (file: File | null) => {
    setForm((prev) => ({ ...prev, file }));
    setFieldErrors((prev) => ({ ...prev, file: undefined }));
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (documentId == null) return;

    const errors = validateDocumentVersionFields(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const versionNo = await addDocumentVersion(documentId, toDocumentVersionCreate(form));
      toast.success(`v${versionNo} 이(가) 업로드되었습니다.`);
      setForm(getDefaultDocumentVersionForm());
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '버전 업로드에 실패했습니다.';
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
