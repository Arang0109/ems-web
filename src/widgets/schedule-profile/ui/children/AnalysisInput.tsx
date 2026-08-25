import type { ScheduleSnapshot } from "@entities/schedule";
import { ScheduleAnalysisEditor } from "@features/save-schedule-analysis";

import type { ScheduleStatus } from "@shared/model";

interface Props {
  scheduleId: number;
  snapshot: ScheduleSnapshot;
  status: ScheduleStatus | null;
  editable: boolean;
  onRefetch: () => void;
}

/**
 * 실험분석 탭.
 *
 * 실험실 단계의 흐름을 그대로 세로로 놓는다 — 시료 접수(진행 정보) → 항목별 분석 결과 →
 * 성적서 작성 완료 확정. 확정은 다른 feature(생애주기) 소관이므로 위젯이 두 feature를 조합한다.
 */
export const AnalysisInput = ({ scheduleId, snapshot, status, editable, onRefetch }: Props) => (
  <div className="space-y-4">
    <ScheduleAnalysisEditor
      scheduleId={scheduleId}
      status={status}
      basicInfo={snapshot.basicInfo}
      items={snapshot.items}
      editable={editable}
      onSaved={onRefetch}
    />
  </div>
);
