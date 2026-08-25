import { RotateCcw, Trash2, X } from "lucide-react";

import type { ScheduleStatus } from "@shared/model";
import { Button } from "@shared/ui/buttons";

import { useScheduleLifecycle } from "../model/hooks/use-schedule-lifecycle";

interface Props {
  scheduleId: number;
  status: ScheduleStatus | null;
  onSuccess?: () => void;
}

/**
 * 측정계획 상세 헤더의 생애주기 액션.
 * 현재 상태에서 가능한 조작만 노출한다 — 취소·삭제는 의미가 다르므로 함께 뜨는 구간이
 * '측정예정'(잘못 등록일 수도, 무산일 수도 있다) 하나뿐이다.
 */
export const ScheduleLifecycleActions = ({ scheduleId, status, onSuccess }: Props) => {
  const {
    canComplete, canCancel, canDelete, canReopen, isLoading,
    handleComplete, handleCancel, handleDelete, handleReopen,
  } = useScheduleLifecycle({ scheduleId, status, onSuccess });

  const hasAction = canComplete || canCancel || canDelete || canReopen;
  if (!hasAction) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canComplete && (
        <Button size="sm" onClick={handleComplete} disabled={isLoading}>성적서 작성 완료</Button>
      )}
      {canReopen && (
        <Button size="sm" variant="outline" startIcon={RotateCcw} onClick={handleReopen} disabled={isLoading}>
          재개방
        </Button>
      )}
      {canCancel && (
        <Button size="sm" variant="destructive" startIcon={X} onClick={handleCancel} disabled={isLoading}>
          측정 취소
        </Button>
      )}
      {canDelete && (
        <Button size="sm" variant="outline" startIcon={Trash2} onClick={handleDelete} disabled={isLoading}>
          삭제
        </Button>
      )}
    </div>
  );
};
