import { CheckCircle2 } from "lucide-react";

import type { ScheduleStatus } from "@shared/model";
import { SectionAccordion } from "@shared/ui/accordion";
import { Button } from "@shared/ui/buttons";

import { useScheduleLifecycle } from "../model/hooks/use-schedule-lifecycle";

interface Props {
  scheduleId: number;
  status: ScheduleStatus | null;
  onSuccess?: () => void;
}

/**
 * 실험분석 탭 하단의 성적서 작성 완료 확정 카드.
 *
 * 헤더의 {@link ScheduleLifecycleActions} 와 같은 조작이지만, 분석이 끝나는 시점이 곧 성적서 작성이 끝나는 시점이라 분석을 마친 자리에서
 * 확정하는 것이 실제 업무 순서다. 확정 조건(분석값입력중)과 확정의 결과(편집 잠금)를
 * 함께 설명해야 하므로 헤더 버튼과 달리 안내문을 동반한다.
 */
export const CompleteScheduleCard = ({ scheduleId, status, onSuccess }: Props) => {
  const { canComplete, isLoading, handleComplete } = useScheduleLifecycle({
    scheduleId, status, onSuccess,
  });

  return (
    <SectionAccordion title="성적서 작성 완료" description={descriptionOf(status)} defaultOpen>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-body-3 text-muted-ink">{guideOf(status)}</p>

        {canComplete && (
          <Button startIcon={CheckCircle2} onClick={handleComplete} disabled={isLoading}>
            {isLoading ? "처리 중..." : "성적서 작성 완료"}
          </Button>
        )}
      </div>
    </SectionAccordion>
  );
};

const descriptionOf = (status: ScheduleStatus | null): string => {
  switch (status) {
    case "ANALYZING":
      return "분석이 끝난 측정계획의 성적서 작성을 완료로 확정합니다.";
    case "REPORT_COMPLETED":
      return "성적서 작성이 완료된 측정계획입니다.";
    case "CANCELED":
      return "취소된 측정계획입니다.";
    default:
      return "분석값입력중으로 넘어간 뒤에 확정할 수 있습니다.";
  }
};

const guideOf = (status: ScheduleStatus | null): string => {
  switch (status) {
    case "ANALYZING":
      return "확정하면 측정정보·측정장비·측정 데이터·실험분석정보가 모두 잠기고 측정 건수 통계에 집계됩니다. "
        + "잘못 확정한 경우 관리자가 재개방할 수 있습니다.";
    case "REPORT_COMPLETED":
      return "다시 편집하려면 상단의 재개방을 사용하세요(관리자 전용).";
    case "CANCELED":
      return "취소된 계획은 확정할 수 없습니다. 다시 진행하려면 상단에서 재개방하세요.";
    default:
      return "위 '분석 진행'에서 시료접수일자를 저장하면 분석값입력중으로 전환되고, 그때 확정 버튼이 나타납니다.";
  }
};
