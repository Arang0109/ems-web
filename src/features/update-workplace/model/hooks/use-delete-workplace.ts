import { useDeleteWorkplaceAction } from "@entities/workplace";
import type { Workplace } from "@entities/workplace";

import { toast } from "@shared/ui/toasts";

interface Props {
  workplace: Workplace | null;
  onSuccess: () => void;
}

export const useDeleteWorkplace = ({ workplace, onSuccess }: Props) => {
  const { deleteWorkplace, isLoading } = useDeleteWorkplaceAction();

  const handleDelete = async () => {
    if (!workplace) return;
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