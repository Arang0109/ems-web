import { useDeleteEquipmentAction, type Equipment } from "@entities/equipment";

import { toast } from "@shared/ui/toasts";

interface Props {
  equipment: Equipment | null;
  onSuccess?: () => void;
}

export const useDeleteEquipment = ({ equipment, onSuccess }: Props) => {
  const { deleteEquipment, isLoading } = useDeleteEquipmentAction();

  const handleDelete = async () => {
    if (!equipment) return;

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
