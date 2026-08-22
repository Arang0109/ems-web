import type { DocumentCategory } from "@shared/model";

import type { DocumentUpdate } from "@entities/document";

import type { DocumentUpdateForm } from "./types";

// validator가 category를 이미 검증하므로 이 시점의 값은 존재가 보장된다.
export const toDocumentUpdate = (form: DocumentUpdateForm): DocumentUpdate => ({
  name: form.name,
  category: form.category as DocumentCategory,
  description: form.description,
});
