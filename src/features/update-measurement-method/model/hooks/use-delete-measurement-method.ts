import { useDeleteMeasurementMethodAction, type MeasurementMethod } from "@entities/measurement-method";

import { toast } from "@shared/ui/toasts";
import { useConfirm } from "@shared/ui/dialogs";

interface Props {
  method: MeasurementMethod | null;
  onSuccess?: () => void;
}

/**
 * 측정방법 삭제. 측정물질이 쓰고 있으면 서버가 409 로 거부한다 — 그 물질의 측정방법을 먼저 바꿔야 한다.
 * 이미 만들어진 측정계획의 스냅샷은 사본이라 영향이 없다.
 */
export const useDeleteMeasurementMethod = ({ method, onSuccess }: Props) => {
  const { deleteMeasurementMethod, isLoading } = useDeleteMeasurementMethodAction();
  const confirm = useConfirm();

  const handleDelete = async () => {
    if (!method) return;

    const isConfirmed = await confirm({
      title: "측정방법 삭제",
      description: `${method.name} 측정방법을 삭제합니다.\n`
        + "이 방법을 쓰는 측정물질이 있으면 삭제할 수 없습니다 — 먼저 그 물질의 측정방법을 바꿔 주세요.",
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteMeasurementMethod(method.id);
      toast.success(`${method.name} 측정방법이 삭제되었습니다.`);
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
