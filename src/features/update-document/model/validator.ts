import { DOCUMENT_TEXT_MAX_LENGTH } from "@entities/document";

import type { DocumentUpdateForm } from "./types";

export const validateDocumentUpdateFields = (form: DocumentUpdateForm) => {
  const errors: Partial<Record<keyof DocumentUpdateForm, string>> = {};

  if (!form.name.trim()) {
    errors.name = '문서명을 입력해주세요.';
  }

  if (!form.category) {
    errors.category = '문서 분류를 선택해주세요.';
  }

  if (form.description.length > DOCUMENT_TEXT_MAX_LENGTH) {
    errors.description = '설명은 500자 이내로 입력해주세요.';
  }

  return errors;
};
