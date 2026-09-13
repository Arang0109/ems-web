import { useNavigate } from "react-router";

import { useAuth, isAdmin } from "@entities/auth";
import {
  useCompleteScheduleAction, useCancelScheduleAction, useReopenScheduleAction,
} from "@entities/schedule";

import {
  canDeleteSchedule, canReopenSchedule, canTransitionScheduleStatus,
  requiresAdminToReopenSchedule, type ScheduleStatus,
} from "@shared/model";
import { useConfirm } from "@shared/ui/dialogs";
import { toast } from "@shared/ui/toasts";

import { useDeleteSchedule } from "./use-delete-schedule";

interface Params {
  scheduleId: number;
  status: ScheduleStatus | null;
  onSuccess?: () => void;
}

interface Result {
  canComplete: boolean;
  canCancel: boolean;
  canDelete: boolean;
  canReopen: boolean;
  isLoading: boolean;
  handleComplete: () => void;
  handleCancel: () => void;
  handleDelete: () => void;
  handleReopen: () => void;
}

/**
 * 측정계획 생애주기 확정 — 완료·취소·삭제·재개방.
 *
 * - **취소**: 실재한 계획이 무산된 것. 계획은 취소 목록에 남아 따로 관리된다.
 * - **삭제**: 계획을 지우는 것. 실측 데이터가 없는 '측정예정'과 '취소'에서만 가능하고 되돌릴 수 없다.
 *
 * 전진(측정중·분석값입력중)은 채취 시작시각·실측값·시료접수일 입력 시 서버가 자동 처리하므로 여기 없다.
 * 노출 여부만 여기서 판단하고 최종 판정은 서버가 한다.
 */
export const useScheduleLifecycle = ({ scheduleId, status, onSuccess }: Params): Result => {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user } = useAuth();

  const { completeSchedule, isLoading: isCompleting } = useCompleteScheduleAction();
  const { cancelSchedule, isLoading: isCanceling } = useCancelScheduleAction();
  const { reopenSchedule, isLoading: isReopening } = useReopenScheduleAction();
  // 삭제 후에는 상세 화면의 대상이 사라지므로 목록으로 돌려보낸다.
  const { handleDelete: deleteSchedule, isLoading: isDeleting } = useDeleteSchedule({
    onSuccess: () => navigate(status === "CANCELED" ? "/schedule/canceled" : "/schedule"),
  });

  const canComplete = status !== null && canTransitionScheduleStatus(status, "REPORT_COMPLETED");
  const canCancel = status !== null && canTransitionScheduleStatus(status, "CANCELED");
  const canDelete = status !== null && canDeleteSchedule(status);
  const canReopen = status !== null && canReopenSchedule(status)
    && (!requiresAdminToReopenSchedule(status) || isAdmin(user?.role));

  const handleComplete = async () => {
    const isConfirmed = await confirm({
      title: "성적서 작성 완료 처리",
      description:
        "측정계획을 성적서 작성 완료로 확정합니다.\n확정 후에는 측정정보·측정장비·측정 데이터를 수정할 수 없습니다.\n" +
        "잘못 확정한 경우 관리자가 재개방할 수 있습니다.",
      confirmLabel: "완료 처리",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await completeSchedule(scheduleId);
      toast.success("측정계획을 성적서 작성 완료로 확정했습니다.");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "성적서 작성 완료 처리에 실패했습니다.");
    }
  };

  const handleCancel = async () => {
    const isConfirmed = await confirm({
      title: "측정 취소",
      description:
        "측정계획을 취소합니다. 계획은 취소 목록에 남습니다.\n" +
        "잘못 등록한 계획이라면 취소가 아니라 삭제로 지워 주세요.",
      confirmLabel: "측정 취소",
      tone: "danger",
    });
    if (!isConfirmed) return;

    try {
      await cancelSchedule(scheduleId);
      toast.success("측정계획을 취소했습니다.");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "취소에 실패했습니다.");
    }
  };

  const handleDelete = () => {
    if (status === null) return;
    void deleteSchedule(scheduleId, status);
  };

  // 완료 재개방과 취소 철회는 같은 조작이지만 사용자가 처한 상황이 달라 설명을 나눈다.
  const handleReopen = async () => {
    const isConfirmed = await confirm({
      title: "측정계획 재개방",
      description:
        status === "CANCELED"
          ? "취소한 측정계획을 되살려 다시 편집할 수 있게 합니다.\n" +
            "입력해 둔 측정 데이터는 그대로 남아 있으며, 진행 단계는 저장된 데이터에 맞춰 복원됩니다."
          : "성적서 작성이 완료된 측정계획을 되돌려 다시 편집할 수 있게 합니다.\n" +
            "재개방하면 측정 건수 통계에서 빠집니다.",
      confirmLabel: "재개방",
    });
    if (!isConfirmed) return;

    try {
      await reopenSchedule(scheduleId);
      toast.success("측정계획을 재개방했습니다. 다시 편집할 수 있습니다.");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "재개방에 실패했습니다.");
    }
  };

  return {
    canComplete, canCancel, canDelete, canReopen,
    isLoading: isCompleting || isCanceling || isDeleting || isReopening,
    handleComplete, handleCancel, handleDelete, handleReopen,
  };
};
