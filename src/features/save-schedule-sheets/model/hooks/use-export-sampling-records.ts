import { useState } from "react";

import { useExportSamplingRecordsAction } from "@entities/schedule";
import { downloadBlob } from "@shared/lib";
import { toast } from "@shared/ui/toasts";

// 서버 spring.servlet.multipart.max-file-size와 동일. 초과하면 서버가 500만 주므로 미리 막는다.
const MAX_TEMPLATE_SIZE = 20 * 1024 * 1024;
const TEMPLATE_EXTENSION = ".xlsx";

interface Params {
  scheduleId: number | null;
  // 다운로드 직전 저장을 수행한다. 성공 여부만 boolean으로 받는다(실패 toast는 저장 쪽 책임).
  saveBeforeExport: () => Promise<boolean>;
}

// 채취기록지 다운로드 시나리오. 템플릿 File은 이 훅의 state로만 보관해
// 같은 화면에 머무는 동안 재선택 없이 재다운로드할 수 있게 하고, 새로고침하면 초기화된다
// (File은 직렬화할 수 없어 localStorage/IndexedDB에 저장하지 않는다).
export const useExportSamplingRecords = ({ scheduleId, saveBeforeExport }: Params) => {
  const { exportSamplingRecords } = useExportSamplingRecordsAction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  // 저장 + 내보내기 전 구간의 로딩. entity 훅의 isLoading은 export 요청 구간만 덮으므로 별도로 둔다.
  const [isExporting, setIsExporting] = useState(false);

  const handleSelectTemplate = (file: File | null) => {
    if (!file) {
      setTemplateFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(TEMPLATE_EXTENSION)) {
      toast.error("엑셀 템플릿(.xlsx) 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_TEMPLATE_SIZE) {
      toast.error("템플릿 파일 크기는 20MB 이하만 가능합니다.");
      return;
    }

    setTemplateFile(file);
  };

  const handleExport = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (scheduleId == null || !templateFile || isExporting) return;

    setIsExporting(true);

    try {
      // 서버는 저장된 측정 데이터로 엑셀을 채우므로 반드시 저장을 먼저 끝낸다.
      if (!(await saveBeforeExport())) return;

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
    templateFile,
    isExporting,

    setIsDialogOpen,
    handleSelectTemplate,
    handleExport,
  };
};
