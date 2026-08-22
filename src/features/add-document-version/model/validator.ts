import { DOCUMENT_TEXT_MAX_LENGTH, MAX_DOCUMENT_FILE_SIZE } from "@entities/document";

import type { DocumentVersionForm } from "./types";

export const validateDocumentVersionFields = (form: DocumentVersionForm) => {
  const errors: Partial<Record<keyof DocumentVersionForm, string>> = {};

  if (!form.file) {
    errors.file = '업로드할 파일을 선택해주세요.';
  } else if (form.file.size === 0) {
    errors.file = '빈 파일은 업로드할 수 없습니다.';
  } else if (form.file.size > MAX_DOCUMENT_FILE_SIZE) {
    errors.file = '파일 크기는 20MB 이하만 가능합니다.';
  }

  if (form.changeNote.length > DOCUMENT_TEXT_MAX_LENGTH) {
    errors.changeNote = '변경 사유는 500자 이내로 입력해주세요.';
  }

  return errors;
};
