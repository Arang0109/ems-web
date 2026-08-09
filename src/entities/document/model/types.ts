import type { DocumentResponse, DocumentVersionResponse } from '../api/dto';

// ─── 문서 분류 ────────────────────────────────────────────────────────────────
// 서버 global.common.enums.DocumentCategory 와 동일한 규격.

export const DOCUMENT_CATEGORY = [
  'REPORT_TEMPLATE',
  'SAMPLING_RECORD_TEMPLATE',
  'CONTRACT',
  'CERTIFICATE',
  'ETC',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORY)[number];

export const DOCUMENT_CATEGORY_LABEL: Record<DocumentCategory, string> = {
  REPORT_TEMPLATE: '성적서 양식',
  SAMPLING_RECORD_TEMPLATE: '채취기록부 양식',
  CONTRACT: '계약서',
  CERTIFICATE: '인증서',
  ETC: '기타',
};

export const documentCategoryOptions = DOCUMENT_CATEGORY.map((value) => ({
  value,
  label: DOCUMENT_CATEGORY_LABEL[value],
}));

// ─── 서버 제약 ────────────────────────────────────────────────────────────────

/** 서버 spring.servlet.multipart.max-file-size와 동일. 초과하면 서버가 500만 주므로 미리 막는다. */
export const MAX_DOCUMENT_FILE_SIZE = 20 * 1024 * 1024;

/** description·changeNote 의 @Size(max = 500) 과 동일 */
export const DOCUMENT_TEXT_MAX_LENGTH = 500;

// ─── 도메인 모델 ──────────────────────────────────────────────────────────────

export type Document = DocumentResponse;
export type DocumentVersion = DocumentVersionResponse;

export type DocumentCreate = {
  name: string;
  category: DocumentCategory;
  description: string;
  changeNote: string;
  file: File;
};

export type DocumentVersionCreate = {
  changeNote: string;
  file: File;
};

export type DocumentUpdate = {
  name: string;
  category: DocumentCategory;
  description: string;
};

/** 다운로드 결과. 엔티티는 DOM 조작(다운로드 트리거)을 하지 않고 데이터만 반환한다. */
export type DocumentDownload = {
  blob: Blob;
  filename: string;
};
