import { useDeleteScheduleCustomFieldAction, type ScheduleCustomField } from "@entities/schedule-custom-field";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  field: ScheduleCustomField | null;
  onSuccess?: () => void;
}

/**
 * 커스텀 필드 삭제. 정의만 지운다 — 이미 회차에 저장된 값은 측정 시점 사본이라 그대로 남고,
 * 양식이 그 키를 계속 참조하면 계속 출력된다. 그 회차의 커스텀 필드를 다음에 저장할 때 정리된다.
 */
export const useDeleteScheduleCustomField = ({ field, onSuccess }: Props) => {
  const { deleteScheduleCustomField, isLoading } = useDeleteScheduleCustomFieldAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!field) return;

    const isConfirmed = await confirm({
      title: "커스텀 필드 삭제",
      description: `${field.label}(${field.key}) 필드를 삭제합니다.\n`
        + "양식이 ${custom." + field.key + "} 를 계속 참조하면 이미 저장된 회차에서는 값이 그대로 출력되고, 새 회차에서는 빈칸이 됩니다.",
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteScheduleCustomField(field.id);
      toast.success(`커스텀 필드 ${field.key} 가 삭제되었습니다.`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "삭제에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    isLoading,

    handleDelete,
  };
};
