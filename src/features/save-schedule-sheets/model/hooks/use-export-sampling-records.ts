import { useState } from "react";

import { useExportSamplingRecordsAction } from "@entities/schedule";
import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

import { useSamplingRecordTemplate } from "./use-sampling-record-template";

interface Params {
  scheduleId: number | null;
  // 다운로드 직전 저장을 수행한다. 성공 여부만 boolean으로 받는다(실패 toast는 저장 쪽 책임).
  saveBeforeExport: () => Promise<boolean>;
}

// 채취기록지 다운로드 시나리오. 템플릿은 관리자가 등록해 둔 채취기록부 양식 문서에서 고르고,
// 고른 버전의 파일을 받아 export API에 실어 보낸다(서버가 저장된 양식을 자동으로 쓰지 않는다).
export const useExportSamplingRecords = ({ scheduleId, saveBeforeExport }: Params) => {
  const { exportSamplingRecords } = useExportSamplingRecordsAction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // 저장 + 템플릿 조회 + 내보내기 전 구간의 로딩. entity 훅의 isLoading은 export 요청 구간만 덮는다.
  const [isExporting, setIsExporting] = useState(false);

  const template = useSamplingRecordTemplate({ enabled: isDialogOpen });

  const handleExport = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (scheduleId == null || !template.canSubmit || isExporting) return;

    setIsExporting(true);

    try {
      // 서버는 저장된 측정 데이터로 엑셀을 채우므로 반드시 저장을 먼저 끝낸다.
      if (!(await saveBeforeExport())) return;

      const templateFile = await template.resolveTemplateFile();
      const { blob, filename } = await exportSamplingRecords(scheduleId, templateFile);
      downloadBlob(blob, filename);
      setIsDialogOpen(false);
      toast.success("채취기록지를 다운로드했습니다.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "채취기록지 다운로드에 실패했습니다.";
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
