import type { ScheduleStatus } from "@shared/model";
import { Button } from "@shared/ui/buttons";

import { useChangeScheduleStatus } from "../model/hooks/use-change-schedule-status";

interface Props {
  scheduleId: number;
  status: ScheduleStatus | null;
  onSuccess?: () => void;
}

/**
 * 측정계획 상세 헤더의 상태 확정 액션.
 * 현재 상태에서 가능한 전이만 노출한다 — 완료·취소된 계획에서는 아무 버튼도 렌더하지 않는다.
 */
export const ChangeScheduleStatusActions = ({ scheduleId, status, onSuccess }: Props) => {
  const { canComplete, canCancel, isLoading, handleComplete, handleCancel } =
    useChangeScheduleStatus({ scheduleId, status, onSuccess });

  if (!canComplete && !canCancel) return null;

  return (
    <div className="flex items-center gap-2">
      {canComplete && (
        <Button size="sm" onClick={handleComplete} disabled={isLoading}>
          측정 완료
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="destructive" onClick={handleCancel} disabled={isLoading}>
          측정 취소
        </Button>
      )}
    </div>
  );
};
