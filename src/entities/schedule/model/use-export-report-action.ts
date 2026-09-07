import { useEntityMutation } from "@shared/model";
import { readBlobErrorMessage, ApiResponseError } from "@shared/api";
import { parseAttachmentFilename } from "@shared/lib";
import type { ReportExport } from "./types";
import { scheduleApi } from "../api/api";

// HTTP status별 폴백 — 서버가 message를 주면 그쪽을 우선한다.
const FALLBACK_MESSAGE: Record<number, string> = {
  404: "측정계획을 찾을 수 없습니다.",
  422: "엑셀 템플릿 처리에 실패했습니다. 템플릿의 jxls 문법을 확인해 주세요.",
  500: "성적서 생성에 실패했습니다. 템플릿 파일을 확인해 주세요.",
};

// 엑셀 템플릿을 올려 측정 데이터가 채워진 성적서 xlsx를 받아온다.
// 다운로드 트리거(DOM 조작)는 UI 후처리이므로 여기서 하지 않고 Blob과 파일명만 반환한다.
export const useExportReportAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, template: File): Promise<ReportExport> => {
    const res = await scheduleApi.exportReport(id, template);

    // 성공 응답이 xlsx 바이너리라 ApiResponseMessage.status로 성공 여부를 볼 수 없고,
    // axiosPrivate 인터셉터가 에러 응답도 resolve로 넘기므로 HTTP status를 직접 판별한다.
    if (res.status < 200 || res.status >= 300) {
      const serverMessage = await readBlobErrorMessage(res.data);
      throw new ApiResponseError(serverMessage ?? FALLBACK_MESSAGE[res.status] ?? "성적서 생성에 실패했습니다.");
    }

    // axios 헤더 값 타입이 string으로 좁혀지지 않아 문자열일 때만 파싱한다.
    const disposition = res.headers["content-disposition"];

    return {
      blob: res.data,
      // 헤더 파싱이 실패해도 서버와 같은 규칙으로 파일명을 만든다.
      filename:
        parseAttachmentFilename(typeof disposition === "string" ? disposition : undefined)
        ?? `성적서-${id}.xlsx`,
    };
  }, { fallbackMessage: "성적서 생성에 실패했습니다." });

  return { exportReport: run, isLoading, error };
};
