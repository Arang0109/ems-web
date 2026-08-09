import type { DocumentCategory } from '../model/types';

export type DocumentResponse = {
  id: number;
  name: string;
  category: DocumentCategory;
  description: string;
  /** 최신 버전 번호. 파일이 아직 없으면 0 */
  latestVersionNo: number;
  createdAt: string;
  modifiedAt: string;
};

export type DocumentVersionResponse = {
  versionNo: number;
  originalFilename: string;
  size: number;
  contentType: string;
  changeNote: string;
  /** 업로더 userId. 서버가 이름을 내려주지 않아 표시에는 쓰지 않는다. */
  uploadedBy: number;
  createdAt: string;
};

/** 파일은 `file` 파트로 따로 보내고 이 타입은 메타를 담는다. FormData 조립은 api.ts 책임. */
export type CreateDocumentRequest = {
  name: string;
  category: DocumentCategory;
  description: string;
  changeNote: string;
  file: File;
};

export type AddDocumentVersionRequest = {
  changeNote: string;
  file: File;
};

/** 서버는 미전달(null/blank) 필드는 기존값을 유지하나, 프론트는 폼 전체 값을 전송한다. */
export type UpdateDocumentRequest = {
  name: string;
  category: DocumentCategory;
  description: string;
};
