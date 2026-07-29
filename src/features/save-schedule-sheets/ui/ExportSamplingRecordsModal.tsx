import { FormDialog } from "@shared/ui/dialogs";
import { FileInput } from "@shared/ui/form";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateFile: File | null;
  isLoading: boolean;
  onSelectTemplate: (file: File | null) => void;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

// 채취기록지 다운로드 — jxls 문법이 든 엑셀 템플릿을 올리면 서버가 시트마다 채워 ZIP으로 돌려준다.
// 고른 템플릿은 페이지에 머무는 동안 유지되므로 재다운로드 시 다시 고를 필요가 없다.
export const ExportSamplingRecordsModal = ({
  open, onOpenChange, templateFile, isLoading, onSelectTemplate, onSubmit,
}: Props) => (
  <FormDialog
    title="채취기록지 다운로드"
    description="엑셀 템플릿(.xlsx)을 선택하면 현재 측정 데이터를 저장한 뒤 채취기록지를 내려받습니다."
    open={open}
    onOpenChange={onOpenChange}
    submitLabel="저장 후 다운로드"
    loadingLabel="생성 중..."
    cancelLabel="취소"
    isLoading={isLoading}
    submitDisabled={!templateFile || isLoading}
    onSubmit={onSubmit}
  >
    <FileInput
      id="sampling-records-template"
      label="엑셀 템플릿"
      required
      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      file={templateFile}
      onChange={onSelectTemplate}
      disabled={isLoading}
      helperText="한 번 선택한 템플릿은 페이지를 벗어나기 전까지 유지됩니다. (최대 20MB)"
    />

    {/* 기록지 종류만큼 파일이 만들어져 ZIP으로 묶이므로 미리 알린다. */}
    <p className="mt-3 text-xs text-muted-foreground">
      기록지 종류별로 엑셀 파일이 생성되어 ZIP으로 압축된 뒤 내려받아집니다.
    </p>
  </FormDialog>
);
