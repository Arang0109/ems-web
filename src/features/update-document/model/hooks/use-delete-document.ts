import { useDeleteDocumentAction } from "@entities/document";
import type { Document } from "@entities/document";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  document: Document | null;
  onSuccess?: () => void;
}

export const useDeleteDocument = ({ document, onSuccess }: Props) => {
  const { deleteDocument, isLoading } = useDeleteDocumentAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!document) return;

    const isConfirmed = await confirm({
      title: '문서 삭제',
      description: `${document.name} 문서를 삭제합니다.\n등록된 모든 버전이 함께 사라지며 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteDocument(document.id);
      toast.success(`${document.name} 문서가 삭제되었습니다.`);
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
