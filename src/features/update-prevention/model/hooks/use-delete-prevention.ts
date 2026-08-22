import { useDeletePreventionAction } from '@entities/stack';
import type { Prevention } from '@entities/stack';
import { toast } from '@shared/ui/toasts';
import { useConfirm } from '@shared/ui/dialogs';

interface Props {
  prevention: Prevention | null;
  onSuccess: () => void;
}

export const useDeletePrevention = ({ prevention, onSuccess }: Props) => {
  const { deletePrevention, isLoading } = useDeletePreventionAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!prevention) return;

    const isConfirmed = await confirm({
      title: '방지시설 삭제',
      description: `${prevention.name}을(를) 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deletePrevention(prevention.id);
      toast.success(`${prevention.name}이(가) 삭제되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return { isLoading, handleDelete };
};
