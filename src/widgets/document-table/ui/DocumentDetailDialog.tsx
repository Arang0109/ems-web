import type { Document } from "@entities/document";
import { AddDocumentVersionForm } from "@features/add-document-version";
import { UpdateDocumentFields, useDeleteDocument, useUpdateDocument } from "@features/update-document";

import { FormDialog } from "@shared/ui/dialogs";
import { Divider } from "@shared/ui/borders";

import { useDocumentDetailDialog } from "../model/use-document-detail-dialog";
import { DocumentVersionSection } from "./DocumentVersionSection";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onSuccess?: () => void;
}

export const DocumentDetailDialog = ({ open, onOpenChange, document, onSuccess }: Props) => {
  const { form, fieldErrors, isLoading, handleChange, handleSubmit } = useUpdateDocument({
    document,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const { handleDelete } = useDeleteDocument({
    document,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const {
    table,
    versionsLoading,
    versionsError,
    uploadOpen, setUploadOpen,
    handleVersionUploaded,
  } = useDocumentDetailDialog({ document, open, onSuccess });

  if (!document) return null;

  return (
    <>
      <FormDialog
        title="문서 상세"
        description="문서 정보를 수정하고 버전 이력을 관리합니다."
        size="xl"
        open={open}
        onOpenChange={onOpenChange}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitLabel="수정"
        deleteLabel="삭제"
        cancelLabel="닫기"
        isLoading={isLoading}
      >
        <UpdateDocumentFields form={form} fieldErrors={fieldErrors} onChange={handleChange} />

        <Divider />

        <DocumentVersionSection
          table={table}
          loading={versionsLoading}
          error={versionsError}
          onUploadClick={() => setUploadOpen(true)}
        />
      </FormDialog>

      {/* 상세 모달의 form 밖에 두어 소유 관계를 명확히 한다(DialogContent는 포털되어 DOM 중첩은 아니다). */}
      <AddDocumentVersionForm
        documentId={document.id}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleVersionUploaded}
      />
    </>
  );
};
