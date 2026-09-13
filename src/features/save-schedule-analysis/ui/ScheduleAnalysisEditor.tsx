import type { MeasurementItemSnapshot, SamplingSheet, ScheduleDetail } from "@entities/schedule";
import type { ScheduleStatus } from "@shared/model";

import { useAnalysisProgress } from "../model/hooks/use-analysis-progress";
import { useScheduleAnalysis } from "../model/hooks/use-schedule-analysis";
import { AnalysisProgressSection } from "./AnalysisProgressSection";
import { AnalysisResultSection } from "./AnalysisResultSection";

interface Props {
  scheduleId: number | null;
  status: ScheduleStatus | null;
  /** 이 회차의 상세 — 진행 정보(일자·서명란 담당자)의 출처 */
  schedule: ScheduleDetail | null;
  items: MeasurementItemSnapshot[];
  /** 현장 기록지 — 채취시각 가져오기의 출처다 */
  sheets: SamplingSheet[];
  editable: boolean;
  /** 저장 후 측정계획 상세 재조회 — 상태 배지·완료 버튼이 이 결과로 갱신된다. */
  onSaved: () => void;
}

/**
 * 실험분석 탭 본문.
 *
 * 저장 경로가 갈라져 있다. 진행 정보는 PATCH report-dates·PATCH tenant 로, 항목별 채취시간·분석 결과는
 * analyses 경로로 간다. 진행 정보의 저장 버튼을 아래 표와 합치지 않은 이유는 두 경로의 실패가
 * 서로를 되돌리지 못하기 때문이다 — 합치면 한쪽만 반영된 상태를 사용자가 알 수 없다.
 * (표 안의 채취시간·분석 결과는 같은 항목의 칸이라 버튼 하나로 두고 훅이 바뀐 경로만 호출한다.)
 */
export const ScheduleAnalysisEditor = ({
  scheduleId, status, schedule, items, sheets, editable, onSaved,
}: Props) => {
  const progress = useAnalysisProgress({ scheduleId, schedule, onSaved });
  const analysis = useScheduleAnalysis({ scheduleId, items, sheets, onSaved });

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
        timeFilledCount={analysis.timeFilledCount}
        onChange={analysis.handleChange}
        onSave={analysis.handleSave}
        onImportSamplingTimes={analysis.importSamplingTimes}
      />
    </div>
  );
};
