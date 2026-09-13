import { useState } from "react";

import { useExportSamplingRecordsAction } from "@entities/schedule";
import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import { useReportTemplate } from "./use-report-template";

interface Params {
  scheduleId: number | null;
}
// 채취기록부 export(`exportSamplingRecords`)를 탄다.**
//
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
