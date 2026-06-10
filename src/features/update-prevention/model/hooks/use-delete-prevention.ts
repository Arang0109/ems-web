import { useDeletePreventionAction } from '@entities/stack';
import type { Prevention } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

interface Props {
  stackId: number;
  prevention: Prevention | null;
  onSuccess: () => void;
}

export const useDeletePrevention = ({ stackId, prevention, onSuccess }: Props) => {
  const { deletePrevention, isLoading } = useDeletePreventionAction();

  const handleDelete = async () => {
    if (!prevention) return;
    try {
      await deletePrevention(stackId, prevention.id);
      toast.success(`${prevention.name}이(가) 삭제되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return { isLoading, handleDelete };
};
