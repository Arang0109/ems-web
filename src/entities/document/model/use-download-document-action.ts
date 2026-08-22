import { useState } from "react";

import { readBlobErrorMessage } from "@shared/api";
import { parseAttachmentFilename } from "@shared/lib";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadDocument = async ({
    documentId,
    versionNo,
    fallbackFilename,
  }: DownloadParams): Promise<DocumentDownload> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = versionNo == null
        ? await documentApi.downloadDocument(documentId)
        : await documentApi.downloadDocumentVersion(documentId, versionNo);

      // 성공 응답이 바이너리라 ApiResponseMessage.status로 성공 여부를 볼 수 없고,
      // axiosPrivate 인터셉터가 에러 응답도 resolve로 넘기므로 HTTP status를 직접 판별한다.
      if (res.status < 200 || res.status >= 300) {
        const serverMessage = await readBlobErrorMessage(res.data);
        throw new Error(serverMessage ?? FALLBACK_MESSAGE[res.status] ?? "문서 다운로드에 실패했습니다.");
      }

      // axios 헤더 값 타입이 string으로 좁혀지지 않아 문자열일 때만 파싱한다.
      const disposition = res.headers["content-disposition"];

      return {
        blob: res.data,
        filename:
          parseAttachmentFilename(typeof disposition === "string" ? disposition : undefined)
          ?? fallbackFilename
          ?? `문서-${documentId}`,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "문서 다운로드에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadDocument, isLoading, error };
};
