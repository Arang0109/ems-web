export type DocumentTableRow = {
  id: number;
  name: string;
  /** 한글 라벨로 변환됨 */
  category: string;
  description: string;
  /** 'v3' 또는 버전이 없으면 '-' */
  latestVersion: string;
  /** 다운로드 버튼 활성 판정용 원본 값 */
  latestVersionNo: number;
  modifiedAt: string;
};

export type DocumentVersionTableRow = {
  /** 버전별 다운로드가 문서 id를 알아야 한다. */
  documentId: number;
  versionNo: number;
  /** 'v3' */
  version: string;
  originalFilename: string;
  /** '1.2 MB' */
  size: string;
  changeNote: string;
  createdAt: string;
};
