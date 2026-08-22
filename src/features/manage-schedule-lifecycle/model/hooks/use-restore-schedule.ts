import { useCallback } from "react";

import { useRestoreScheduleAction } from "@entities/schedule";

import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

interface Params {
  onSuccess?: () => void;
}

/**
 * 삭제(감춤)된 측정계획을 되살린다(관리자 전용).
 * 삭제 후 같은 측정시설·팀·채취일자로 다시 등록한 계획이 있으면 서버가 409로 거부하므로,
 * 실패 문구를 그대로 보여 준다.
 */
export const useRestoreSchedule = ({ onSuccess }: Params = {}) => {
  const { restoreSchedule, isLoading } = useRestoreScheduleAction();
  const confirm = useConfirm();

  // 표 컬럼 정의에 실려 들어가므로 렌더마다 새 함수가 되지 않도록 고정한다.
  const handleRestore = useCallback(async (scheduleId: number) => {
    const isConfirmed = await confirm({
      title: "측정계획 복구",
      description: "삭제된 측정계획을 목록으로 되돌립니다.\n삭제 시점의 상태를 그대로 회복합니다.",
      confirmLabel: "복구",
    });
    if (!isConfirmed) return;

    try {
      await restoreSchedule(scheduleId);
      toast.success("측정계획을 복구했습니다.");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "복구에 실패했습니다.");
    }
  }, [confirm, restoreSchedule, onSuccess]);

  return { handleRestore, isLoading };
};
