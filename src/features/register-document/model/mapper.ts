import type { DocumentCategory } from "@shared/model";

import type { DocumentCreate } from "@entities/document";

import type { DocumentRegisterForm } from "./types";

// validator가 file/category를 이미 검증하므로 이 시점의 값은 존재가 보장된다.
export const toDocumentCreate = (form: DocumentRegisterForm): DocumentCreate => ({
  name: form.name,
  category: form.category as DocumentCategory,
  description: form.description,
  changeNote: form.changeNote,
  file: form.file as File,
});
