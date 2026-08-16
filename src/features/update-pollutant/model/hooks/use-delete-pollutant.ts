import { useDeletePollutantAction, type Pollutant } from "@entities/pollutant";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  pollutant: Pollutant | null;
  onSuccess?: () => void;
}

export const useDeletePollutant = ({ pollutant, onSuccess }: Props) => {
  const { deletePollutant, isLoading } = useDeletePollutantAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!pollutant) return;

    const isConfirmed = await confirm({
      title: '측정물질 삭제',
      // 측정시설의 측정항목이 참조 중이면 서버가 거부하므로 실패 메시지를 그대로 노출한다.
      description: `${pollutant.nameKr} 측정물질을 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deletePollutant(pollutant.id);
      toast.success(`${pollutant.nameKr} 측정물질이 삭제되었습니다.`);
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
