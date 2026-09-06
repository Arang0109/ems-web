import { useCallback } from "react";

import { useDeleteScheduleAction } from "@entities/schedule";

import type { ScheduleStatus } from "@shared/model";
import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

interface Params {
  onSuccess?: (scheduleId: number) => void;
}

/**
 * 측정계획을 지운다. 상세 헤더와 취소 목록의 행 액션이 함께 쓴다.
 *
 * 확인 문구가 상태마다 다른 이유는 같은 조작이라도 사용자가 처한 상황이 다르기 때문이다 —
 * '측정예정'은 잘못 등록한 것을 지우는 상황이고, '취소'는 남길 이력과 실수로 만든 계획을
 * 가려내는 상황이다.
 */
export const useDeleteSchedule = ({ onSuccess }: Params = {}) => {
  const { deleteSchedule, isLoading } = useDeleteScheduleAction();
  const confirm = useConfirm();

  // 표 컬럼 정의에 실려 들어가므로 렌더마다 새 함수가 되지 않도록 고정한다.
  const handleDelete = useCallback(async (scheduleId: number, status: ScheduleStatus) => {
    const isConfirmed = await confirm({
      title: "측정계획 삭제",
      description:
        status === "CANCELED"
          ? "취소된 측정계획을 지웁니다.\n" +
            "측정 데이터와 실험분석정보까지 함께 삭제되며 되돌릴 수 없습니다."
          : "잘못 등록된 측정계획을 지웁니다.\n" +
            "되돌릴 수 없으므로, 측정이 무산된 건이라면 삭제가 아니라 '측정 취소'로 남겨 주세요.",
      confirmLabel: "삭제",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await deleteSchedule(scheduleId);
      toast.success("측정계획을 삭제했습니다.");
      onSuccess?.(scheduleId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  }, [confirm, deleteSchedule, onSuccess]);

  return { handleDelete, isLoading };
};
