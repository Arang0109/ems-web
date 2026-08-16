import { useChangeScheduleStatusAction } from "@entities/schedule";

import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import { canTransitionScheduleStatus, type ScheduleStatus } from "@shared/model";
import { useConfirm, type ConfirmOptions } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

interface Params {
  scheduleId: number;
  status: ScheduleStatus | null;
  onSuccess?: () => void;
}

/**
 * 측정계획의 종료 전이(완료·취소)를 확정한다.
 * 전진(측정중·분석중)은 시트 저장·시료접수일 입력 시 서버가 자동으로 처리하므로 여기서 다루지 않는다.
 * 두 전이 모두 되돌릴 수 없고 이후 편집이 잠기므로 확인 다이얼로그를 거친다.
 */
export const useChangeScheduleStatus = ({ scheduleId, status, onSuccess }: Params) => {
  const { changeScheduleStatus, isLoading } = useChangeScheduleStatusAction();
  const confirm = useConfirm();

  const canComplete = status !== null && canTransitionScheduleStatus(status, "COMPLETED");
  const canCancel = status !== null && canTransitionScheduleStatus(status, "CANCELED");

  const run = async (next: ScheduleStatus, options: ConfirmOptions) => {
    const isConfirmed = await confirm(options);
    if (!isConfirmed) return;

    try {
      await changeScheduleStatus(scheduleId, next);
      toast.success(`측정계획을 '${SCHEDULE_STATUS_LABEL[next]}' 상태로 변경했습니다.`);
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "상태 변경에 실패했습니다.";
      toast.error(message);
    }
  };

  const handleComplete = () =>
    run("COMPLETED", {
      title: "측정 완료 처리",
      description:
        "측정계획을 완료 처리합니다.\n완료 후에는 측정정보·측정장비·측정 데이터를 수정할 수 없습니다.",
      confirmLabel: "완료 처리",
      tone: "danger",
    });

  const handleCancel = () =>
    run("CANCELED", {
      title: "측정 취소",
      description: "측정계획을 취소합니다.\n취소 후에는 되돌리거나 수정할 수 없습니다.",
      confirmLabel: "측정 취소",
      tone: "danger",
    });

  return { canComplete, canCancel, isLoading, handleComplete, handleCancel };
};
