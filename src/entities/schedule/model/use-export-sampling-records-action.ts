import { useEntityMutation } from "@shared/model";
import { unwrapBlob } from "@shared/api";
import type { SamplingRecordsExport } from "./types";
import { scheduleApi } from "../api/api";

// HTTP status별 폴백 — 서버가 message를 주면 그쪽을 우선한다.
const FALLBACK_MESSAGE: Record<number, string> = {
  404: "측정계획을 찾을 수 없습니다.",
  422: "엑셀 템플릿 처리에 실패했습니다. 템플릿의 jxls 문법을 확인해 주세요.",
  500: "채취기록지 생성에 실패했습니다. 템플릿 파일을 확인해 주세요.",
};

// 엑셀 템플릿을 올려 시트별로 채워진 채취기록지 ZIP을 받아온다.
// 다운로드 트리거(DOM 조작)는 UI 후처리이므로 여기서 하지 않고 Blob과 파일명만 반환한다.
export const useExportSamplingRecordsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, template: File): Promise<SamplingRecordsExport> => {
    const res = await scheduleApi.exportSamplingRecords(id, template);

    return unwrapBlob(res, {
      fallbackMessage: "채취기록지 생성에 실패했습니다.",
      messageByStatus: FALLBACK_MESSAGE,
      // 헤더 파싱이 실패해도 서버와 같은 규칙으로 파일명을 만든다.
      fallbackFilename: `채취기록부-${id}.zip`,
    });
  }, { fallbackMessage: "채취기록지 생성에 실패했습니다." });

  return { exportSamplingRecords: run, isLoading, error };
};
