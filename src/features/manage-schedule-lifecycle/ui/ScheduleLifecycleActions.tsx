import { RotateCcw, Trash2, X } from "lucide-react";

import type { ScheduleStatus } from "@shared/model";
import { Button } from "@shared/ui/buttons";

import { useScheduleLifecycle } from "../model/hooks/use-schedule-lifecycle";
import { ReasonDialog } from "./ReasonDialog";

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
    handleComplete, handleDelete, cancelDialog, reopenDialog,
  } = useScheduleLifecycle({ scheduleId, status, onSuccess });

  const hasAction = canComplete || canCancel || canDelete || canReopen;
  if (!hasAction) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canComplete && (
          <Button size="sm" onClick={handleComplete} disabled={isLoading}>성적서 작성 완료</Button>
        )}
        {canReopen && (
          <Button size="sm" variant="outline" startIcon={RotateCcw} onClick={reopenDialog.open} disabled={isLoading}>
            재개방
          </Button>
        )}
        {canCancel && (
          <Button size="sm" variant="destructive" startIcon={X} onClick={cancelDialog.open} disabled={isLoading}>
            측정 취소
          </Button>
        )}
        {canDelete && (
          <Button size="sm" variant="outline" startIcon={Trash2} onClick={handleDelete} disabled={isLoading}>
            삭제
          </Button>
        )}
      </div>

      <ReasonDialog
        state={cancelDialog}
        isLoading={isLoading}
        title="측정 취소"
        description={
          "측정계획을 취소합니다. 계획은 목록에 남고 사유가 이력에 기록됩니다.\n" +
          "취소는 되돌릴 수 없습니다 — 다시 측정하려면 새로 등록해야 합니다."
        }
        label="취소 사유"
        placeholder="예) 의뢰기관 요청으로 측정 일정 취소"
        submitLabel="측정 취소"
        loadingLabel="취소 중..."
      />

      {/* 완료 재개방과 취소 철회는 같은 조작이지만 사용자가 처한 상황이 달라 설명을 나눈다. */}
      <ReasonDialog
        state={reopenDialog}
        isLoading={isLoading}
        title="측정계획 재개방"
        description={
          status === "CANCELED"
            ? "취소한 측정계획을 되살려 다시 편집할 수 있게 합니다.\n" +
              "입력해 둔 측정 데이터는 그대로 남아 있으며, 진행 단계는 저장된 데이터에 맞춰 복원됩니다."
            : "성적서 작성이 완료된 측정계획을 되돌려 다시 편집할 수 있게 합니다.\n" +
              "재개방하면 측정 건수 통계에서 빠집니다."
        }
        label="재개방 사유"
        placeholder={
          status === "CANCELED"
            ? "예) 취소 대상을 잘못 선택함"
            : "예) 성적서 발행일자 오기입으로 재작성 필요"
        }
        submitLabel="재개방"
        loadingLabel="재개방 중..."
      />
    </>
  );
};
