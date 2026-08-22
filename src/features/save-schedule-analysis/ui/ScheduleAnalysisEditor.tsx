import type { BasicInfo, MeasurementItemSnapshot } from "@entities/schedule";
import type { ScheduleStatus } from "@shared/model";

import { useAnalysisProgress } from "../model/hooks/use-analysis-progress";
import { useScheduleAnalysis } from "../model/hooks/use-schedule-analysis";
import { AnalysisProgressSection } from "./AnalysisProgressSection";
import { AnalysisResultSection } from "./AnalysisResultSection";

interface Props {
  scheduleId: number | null;
  status: ScheduleStatus | null;
  basicInfo: BasicInfo | null;
  items: MeasurementItemSnapshot[];
  editable: boolean;
  /** 저장 후 측정계획 상세 재조회 — 상태 배지·완료 버튼이 이 결과로 갱신된다. */
  onSaved: () => void;
}

/**
 * 실험분석 탭 본문.
 *
 * 두 저장 경로가 한 화면에 있다. 진행 정보는 계획 문서(PATCH basic-info)로, 항목별 분석 결과는
 * 별도 컬렉션(analyses)으로 간다. 저장 버튼을 하나로 합치지 않은 이유는 두 경로의 실패가
 * 서로를 되돌리지 못하기 때문이다 — 합치면 한쪽만 반영된 상태를 사용자가 알 수 없다.
 */
export const ScheduleAnalysisEditor = ({
  scheduleId, status, basicInfo, items, editable, onSaved,
}: Props) => {
  const progress = useAnalysisProgress({ scheduleId, basicInfo, onSaved });
  const analysis = useScheduleAnalysis({ scheduleId, items, onSaved });

  return (
    <div className="space-y-4">
      <AnalysisProgressSection
        form={progress.form}
        editable={editable}
        isDirty={progress.isDirty}
        isLoading={progress.isLoading}
        isBeforeAnalyzing={status === "SCHEDULED" || status === "MEASURING"}
        onChange={progress.handleChange}
        onSave={progress.handleSave}
      />

      <AnalysisResultSection
        rows={analysis.rows}
        fieldErrors={analysis.fieldErrors}
        editable={editable}
        isDirty={analysis.isDirty}
        isLoading={analysis.isLoading}
        filledCount={analysis.filledCount}
        onChange={analysis.handleChange}
        onSave={analysis.handleSave}
        onRemove={analysis.handleRemove}
      />
    </div>
  );
};
