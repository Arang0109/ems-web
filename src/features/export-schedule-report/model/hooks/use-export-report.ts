import { useState } from "react";

import { useExportSamplingRecordsAction } from "@entities/schedule";
import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import { useReportTemplate } from "./use-report-template";

interface Params {
  scheduleId: number | null;
}

// 성적서 탭의 다운로드 시나리오. 템플릿은 관리자가 등록해 둔 양식 문서에서 고르고,
// 고른 버전의 파일을 받아 export API에 실어 보낸다(서버가 저장된 양식을 자동으로 쓰지 않는다).
//
// **당분간 성적서 export(`exportReport`)가 아니라 채취기록부 export(`exportSamplingRecords`)를 탄다.**
// 두 엔드포인트는 jxls 컨텍스트가 다르므로(성적서=전 시트 단일 xlsx, 채취기록부=시트별 ZIP)
// 양식 분류도 함께 채취기록부로 맞춰 둔다(useReportTemplate 참고). 성적서 export 를 쓰게 되면
// 이 훅의 액션과 양식 분류를 같이 되돌린다.
//
// 채취기록지 탭(useExportSamplingRecords)과 달리 저장을 선행하지 않는다 — 성적서 탭은
// 측정값을 편집하는 화면이 아니라 이미 저장된 데이터를 그대로 내보내는 화면이다.
export const useExportReport = ({ scheduleId }: Params) => {
  const { exportSamplingRecords } = useExportSamplingRecordsAction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // 템플릿 내려받기 + 내보내기 전 구간의 로딩. entity 훅의 isLoading은 export 요청 구간만 덮는다.
  const [isExporting, setIsExporting] = useState(false);

  const template = useReportTemplate({ enabled: isDialogOpen });

  const handleExport = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (scheduleId == null || !template.canSubmit || isExporting) return;

    setIsExporting(true);

    try {
      const templateFile = await template.resolveTemplateFile();
      const { blob, filename } = await exportSamplingRecords(scheduleId, templateFile);
      downloadBlob(blob, filename);
      setIsDialogOpen(false);
      toast.success("채취기록부를 다운로드했습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "채취기록부 다운로드에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isDialogOpen,
    isExporting,
    template,

    setIsDialogOpen,
    handleExport,
  };
};
