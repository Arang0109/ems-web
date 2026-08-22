import type { DocumentCategory } from "@shared/model";

export type DocumentUpdateForm = {
  name: string;
  category: DocumentCategory | '';   // 미선택은 ''
  description: string;
};

export const getDefaultDocumentUpdateForm = (): DocumentUpdateForm => ({
  name: '',
  category: '',
  description: '',
});
