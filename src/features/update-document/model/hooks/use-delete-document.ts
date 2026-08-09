import { useDeleteDocumentAction } from "@entities/document";
import type { Document } from "@entities/document";

import { toast } from "@shared/ui/toasts";

interface Props {
  document: Document | null;
  onSuccess?: () => void;
}

export const useDeleteDocument = ({ document, onSuccess }: Props) => {
  const { deleteDocument, isLoading } = useDeleteDocumentAction();

  const handleDelete = async () => {
    if (!document) return;

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
