import { useDeleteEquipmentAction, type Equipment } from "@entities/equipment";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  equipment: Equipment | null;
  onSuccess?: () => void;
}

export const useDeleteEquipment = ({ equipment, onSuccess }: Props) => {
  const { deleteEquipment, isLoading } = useDeleteEquipmentAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!equipment) return;

    const isConfirmed = await confirm({
      title: '측정장비 삭제',
      description: `${equipment.equipmentName}을(를) 삭제합니다.\n삭제 후에는 되돌릴 수 없습니다.`,
      confirmLabel: '삭제',
      tone: 'danger',
    });
    if (!isConfirmed) return;

    try {
      await deleteEquipment(equipment.id);
      toast.success(`${equipment.equipmentName}이(가) 삭제되었습니다.`);
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
