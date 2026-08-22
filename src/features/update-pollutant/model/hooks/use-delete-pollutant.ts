import { useDeletePollutantAction, type Pollutant } from "@entities/pollutant";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  pollutant: Pollutant | null;
  onSuccess?: () => void;
}

/**
 * 측정물질 삭제 — 이 고객사의 채택을 취소한다.
 *
 * 가이드 항목 자체는 전역 마스터라 사라지지 않으므로, 삭제 후 다시 채택할 수 있다.
 * 측정시설의 측정항목이 참조 중이면 서버가 거부한다.
 */
export const useDeletePollutant = ({ pollutant, onSuccess }: Props) => {
  const { deletePollutant, isLoading } = useDeletePollutantAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!pollutant) return;

    const isConfirmed = await confirm({
      title: '측정물질 삭제',
      description: `${pollutant.nameKr} 측정물질을 목록에서 제외합니다.\n`
        + `입력한 영문명·분석장비·공정시험법은 함께 지워집니다(다시 등록하면 새로 입력해야 합니다).`,
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
