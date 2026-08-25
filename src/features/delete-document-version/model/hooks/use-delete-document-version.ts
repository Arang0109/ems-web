import { useDeleteDocumentVersionAction } from "@entities/document";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  /** null이면 삭제하지 않는다. 상세 모달이 닫혀 있을 때 null을 넘긴다. */
  documentId: number | null;
  onSuccess?: () => void;
}

export const useDeleteDocumentVersion = ({ documentId, onSuccess }: Props) => {
  const { deleteDocumentVersion, isLoading } = useDeleteDocumentVersionAction();
  const confirm = useConfirm();

  const handleDelete = async (versionNo: number) => {
    if (documentId == null) return;

    const isConfirmed = await confirm({
      title: '버전 삭제',
      description: `v${versionNo} 버전을 삭제합니다.\n업로드된 파일이 함께 사라지며 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteDocumentVersion(documentId, versionNo);
      toast.success(`v${versionNo} 버전이 삭제되었습니다.`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,

    handleDelete,
  };
};
