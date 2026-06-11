import { useDeleteFacilityAction } from '@entities/stack';
import type { Facility } from '@entities/stack';
import { toast } from '@shared/ui/toasts';

interface Props {
  stackId: number;
  facility: Facility | null;
  onSuccess: () => void;
}

export const useDeleteFacility = ({ stackId, facility, onSuccess }: Props) => {
  const { deleteFacility, isLoading } = useDeleteFacilityAction();

  const handleDelete = async () => {
    if (!facility) return;
    try {
      await deleteFacility(stackId, facility.id);
      toast.success(`${facility.name}이(가) 삭제되었습니다.`);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제에 실패했습니다.');
    }
  };

  return { isLoading, handleDelete };
};
