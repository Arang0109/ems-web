import type { Document, DocumentVersion } from "@entities/document";
import { DOCUMENT_CATEGORY_LABEL } from "@shared/config";
import { formatDateTime, formatFileSize } from "@shared/lib";

import type { DocumentTableRow, DocumentVersionTableRow } from "./types";

export const toDocumentRows = (col: Document): DocumentTableRow => ({
  id: col.id,
  name: col.name,
  category: DOCUMENT_CATEGORY_LABEL[col.category] ?? col.category,
  description: col.description,
  // 파일이 아직 없는 문서(latestVersionNo === 0)는 버전을 표시하지 않는다.
  latestVersion: col.latestVersionNo > 0 ? `v${col.latestVersionNo}` : '-',
  latestVersionNo: col.latestVersionNo,
  modifiedAt: formatDateTime(col.modifiedAt),
});

export const toDocumentVersionRows = (
  col: DocumentVersion,
  documentId: number,
  isDeletable: boolean,
): DocumentVersionTableRow => ({
  documentId,
  versionNo: col.versionNo,
  version: `v${col.versionNo}`,
  originalFilename: col.originalFilename,
  size: formatFileSize(col.size),
  changeNote: col.changeNote,
  createdAt: formatDateTime(col.createdAt),
  isDeletable,
});
