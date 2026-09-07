import { formatFileSize } from "@shared/lib";
import { FormDialog } from "@shared/ui/dialogs";
import { Select } from "@shared/ui/form";

import type { ReportTemplate } from "../model/hooks/use-report-template";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: ReportTemplate;
  isLoading: boolean;
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
}

// 성적서 탭의 다운로드 — 관리자가 등록해 둔 채취기록부 양식(문서 + 버전)을 고르면
// 서버가 그 템플릿의 시트마다 측정 데이터를 채워 ZIP으로 돌려준다.
//
// 성적서 export 가 아직 쓰이지 않아 당분간 채취기록부 export 를 탄다(useExportReport 참고).
// 문구도 실제로 내려받는 것에 맞춰 두었다 — 되돌릴 때 함께 성적서 문구로 되돌린다.
export const ExportReportModal = ({
  open, onOpenChange, template, isLoading, onSubmit,
}: Props) => {
  const {
    documentOptions, versionOptions, documentId, selectedVersion,
    isDocumentsLoading, isVersionsLoading, loadError, templateError, canSubmit,
    handleSelectDocument, handleSelectVersion,
  } = template;

  const hasDocuments = documentOptions.length > 0;

  return (
    <FormDialog
      title="채취기록부 다운로드"
      description="등록된 채취기록부 양식을 선택하면 저장된 측정 데이터를 채워 내려받습니다."
      open={open}
      onOpenChange={onOpenChange}
      submitLabel="다운로드"
      loadingLabel="생성 중..."
      cancelLabel="취소"
      isLoading={isLoading}
      submitDisabled={!canSubmit || isLoading}
      onSubmit={onSubmit}
    >
      {/* 미선택 값은 undefined(비제어)가 아니라 빈 문자열로 둔다 — Base UI는 빈 값에도 placeholder를 띄운다. */}
      <div className="space-y-3">
        <Select
          id="report-template-document"
          searchable
          label="채취기록부 양식"
          required
          options={documentOptions}
          placeholder={hasDocuments ? "양식을 선택하세요" : "등록된 양식이 없습니다"}
          value={documentId != null ? String(documentId) : ""}
          onValueChange={(value) => handleSelectDocument(value ? Number(value) : null)}
          disabled={isLoading || isDocumentsLoading || !hasDocuments}
        />

        <Select
          id="report-template-version"
          label="버전"
          required
          options={versionOptions}
          placeholder="버전을 선택하세요"
          value={selectedVersion ? String(selectedVersion.versionNo) : ""}
          onValueChange={(value) => handleSelectVersion(value ? Number(value) : null)}
          disabled={isLoading || isVersionsLoading || documentId == null || versionOptions.length === 0}
          helperText={
            selectedVersion
              ? `설명 : ${selectedVersion.changeNote} · ${formatFileSize(selectedVersion.size)}`
              : undefined
          }
        />
      </div>

      {/* 양식이 아예 없으면 어디서 등록하는지까지 알려준다. */}
      {!hasDocuments && !isDocumentsLoading && !loadError && (
        <p className="mt-3 text-caption text-muted-foreground">
          등록된 채취기록부 양식이 없습니다. 관리자 문서 관리에서 먼저 양식을 등록해 주세요.
        </p>
      )}

      {(loadError || templateError) && (
        <p className="mt-3 text-caption text-destructive">{loadError ?? templateError}</p>
      )}

      {/* 기록지 종류만큼 파일이 만들어져 ZIP으로 묶이므로 미리 알린다. */}
      <p className="mt-3 text-caption text-muted-foreground">
        기록지 종류별로 엑셀 파일이 생성되어 ZIP으로 압축된 뒤 내려받아집니다.
      </p>
    </FormDialog>
  );
};
