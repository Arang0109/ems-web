import { useDeleteSubstanceAction } from '@entities/stack';
import type { TargetSubstance } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

interface Props {
  substance: TargetSubstance | null;
  onSuccess: () => void;
}

export const useDeleteSubstance = ({ substance, onSuccess }: Props) => {
  const { deleteSubstance, isLoading } = useDeleteSubstanceAction();

  const handleDelete = async () => {
    if (!substance) return;
    try {
      await deleteSubstance(substance.id);
      toast.success(`${substance.name}이(가) 삭제되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return { isLoading, handleDelete };
};
