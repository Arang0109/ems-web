import { useDownloadDocumentAction } from "@entities/document";

import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

interface DownloadParams {
  documentId: number;
  /** 미지정이면 최신본을 받는다. */
  versionNo?: number;
  fallbackFilename?: string;
}

// 문서 다운로드 시나리오. 목록의 최신본 버튼과 상세 모달의 버전별 버튼 양쪽에서 쓰인다.
export const useDownloadDocument = () => {
  const { downloadDocument, isLoading } = useDownloadDocumentAction();

  const handleDownload = async (params: DownloadParams) => {
    try {
      const { blob, filename } = await downloadDocument(params);
      downloadBlob(blob, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : '문서 다운로드에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isDownloading: isLoading,

    handleDownload,
  };
};
