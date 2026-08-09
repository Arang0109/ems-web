export { documentApi } from './api/api';

export type {
  Document,
  DocumentVersion,
  DocumentCreate,
  DocumentVersionCreate,
  DocumentUpdate,
  DocumentDownload,
  DocumentCategory,
} from './model/types';

export {
  DOCUMENT_CATEGORY,
  DOCUMENT_CATEGORY_LABEL,
  documentCategoryOptions,
  MAX_DOCUMENT_FILE_SIZE,
  DOCUMENT_TEXT_MAX_LENGTH,
} from './model/types';

export { useDocuments } from './model/use-documents';
export { useDocumentDetail } from './model/use-document-detail';
export { useDocumentVersions } from './model/use-document-versions';

export { useRegisterDocumentAction } from './model/use-register-document-action';
export { useAddDocumentVersionAction } from './model/use-add-document-version-action';
export { useUpdateDocumentAction } from './model/use-update-document-action';
export { useDeleteDocumentAction } from './model/use-delete-document-action';
export { useDownloadDocumentAction } from './model/use-download-document-action';
