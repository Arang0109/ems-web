import type { DocumentVersionCreate } from "@entities/document";

import type { DocumentVersionForm } from "./types";

// validator가 file을 이미 검증하므로 이 시점의 값은 존재가 보장된다.
export const toDocumentVersionCreate = (form: DocumentVersionForm): DocumentVersionCreate => ({
  changeNote: form.changeNote,
  file: form.file as File,
});
