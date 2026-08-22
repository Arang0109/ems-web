import { useDeleteStackPollutantAction } from "@entities/stack-pollutant";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  onSuccess: () => void;
}

/**
 * 측정시설 원장에서 측정항목을 지운다.
 *
 * 대상을 훅 인자가 아니라 `handleDelete` 인자로 받는 것은 목록의 행마다 곧바로 호출되기 때문이다 —
 * 선택 상태를 거치면 `setState` 직후의 호출이 이전 행을 지운다.
 */
export const useDeleteStackPollutant = ({ onSuccess }: Props) => {
  const { deleteStackPollutant, isLoading } = useDeleteStackPollutantAction();
  const confirm = useConfirm();

  const handleDelete = async (item: StackPollutantListItem) => {
    const isConfirmed = await confirm({
      title: '측정항목 삭제',
      description: `${item.pollutant.nameKr}을(를) 이 측정시설의 측정항목에서 삭제합니다.
이미 세운 측정계획의 측정항목은 그대로 남습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteStackPollutant(item.id);
      toast.success(`${item.pollutant.nameKr}이(가) 삭제되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return { isLoading, handleDelete };
};
