import { FormDialog } from "@shared/ui/dialogs";
import { FieldGroup, FileInput, Textarea } from "@shared/ui/form";

import { useAddDocumentVersion } from "../model/hooks/use-add-document-version";

interface Props {
  documentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// 트리거는 상세 모달(=form) 안에 놓이므로 triggerLabel을 쓰지 않고 open 제어형으로만 노출한다.
export const AddDocumentVersionForm = ({ documentId, open, onOpenChange, onSuccess }: Props) => {
  const {
    form,
    isLoading,
    fieldErrors,
    handleChange,
    handleFileChange,
    handleSubmit,
  } = useAddDocumentVersion({
    documentId,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  return (
    <FormDialog
      title="새 버전 업로드"
      description="새 파일을 올리면 다음 버전 번호가 자동으로 부여됩니다."
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={handleSubmit}
      submitLabel="업로드"
      loadingLabel="업로드 중..."
      isLoading={isLoading}
    >
      <FieldGroup>
        <FileInput
          id="versionFile"
          label="문서 파일"
          file={form.file}
          onChange={handleFileChange}
          isInvalid={!!fieldErrors?.file}
          helperText={fieldErrors?.file ?? '20MB 이하의 파일을 등록할 수 있습니다.'}
          required
        />
        <Textarea
          id="versionChangeNote"
          label="변경 사유"
          placeholder="이번 버전에서 달라진 점"
          value={form.changeNote}
          onChange={(value) => handleChange('changeNote', value)}
          rows={2}
          maxLength={500}
          helperText={fieldErrors?.changeNote}
        />
      </FieldGroup>
    </FormDialog>
  );
};
