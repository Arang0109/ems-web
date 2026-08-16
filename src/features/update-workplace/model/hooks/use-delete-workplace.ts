import { useDeleteWorkplaceAction } from "@entities/workplace";
import type { Workplace } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  workplace: Workplace | null;
  onSuccess: () => void;
}

export const useDeleteWorkplace = ({ workplace, onSuccess }: Props) => {
  const { deleteWorkplace, isLoading } = useDeleteWorkplaceAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!workplace) return;

    const isConfirmed = await confirm({
      title: '사업장 삭제',
      description: `${workplace.name}을(를) 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteWorkplace(workplace.id);
      toast.success(`${workplace.name}이(가) 삭제되었습니다.`)
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : '삭제에 실패했습니다.';
      toast.error(message);
    }
  };

  return {
    isLoading,

    handleDelete,
  }
}