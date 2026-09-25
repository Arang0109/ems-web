import { useEntityMutation } from "@shared/model";
import { unwrapBlob } from "@shared/api";
import { documentApi } from "../api/api";
import type { DocumentDownload } from "./types";

// HTTP status별 폴백 — 서버가 message를 주면 그쪽을 우선한다.
const FALLBACK_MESSAGE: Record<number, string> = {
  404: "문서 또는 해당 버전을 찾을 수 없습니다.",
  500: "문서의 실제 파일을 찾을 수 없습니다.",
};

interface DownloadParams {
  documentId: number;
  /** 미지정이면 최신본을 받는다. */
  versionNo?: number;
  /** Content-Disposition 파싱이 실패했을 때 쓸 파일명 */
  fallbackFilename?: string;
}

// 최신본/버전별 다운로드는 응답 처리가 완전히 동일해 한 훅에서 versionNo로 분기한다.
// 다운로드 트리거(DOM 조작)는 UI 후처리이므로 여기서 하지 않고 Blob과 파일명만 반환한다.
export const useDownloadDocumentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async ({
    documentId,
    versionNo,
    fallbackFilename,
  }: DownloadParams): Promise<DocumentDownload> => {
    const res = versionNo == null
      ? await documentApi.downloadDocument(documentId)
      : await documentApi.downloadDocumentVersion(documentId, versionNo);

    return unwrapBlob(res, {
      fallbackMessage: "문서 다운로드에 실패했습니다.",
      messageByStatus: FALLBACK_MESSAGE,
      fallbackFilename: fallbackFilename ?? `문서-${documentId}`,
    });
  }, { fallbackMessage: "문서 다운로드에 실패했습니다." });

  return { downloadDocument: run, isLoading, error };
};
