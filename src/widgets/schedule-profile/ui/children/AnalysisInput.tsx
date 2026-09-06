import type { ScheduleDetail, ScheduleSnapshot } from "@entities/schedule";
import { ScheduleAnalysisEditor } from "@features/save-schedule-analysis";

import type { ScheduleStatus } from "@shared/model";

interface Props {
  scheduleId: number;
  /** 진행 정보(일자·서명란 담당자)는 스냅샷이 아니라 상세 최상위·고객사 스냅샷에 있다. */
  schedule: ScheduleDetail | null;
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
export const AnalysisInput = ({ scheduleId, schedule, snapshot, status, editable, onRefetch }: Props) => (
  <div className="space-y-4">
    <ScheduleAnalysisEditor
      scheduleId={scheduleId}
      status={status}
      schedule={schedule}
      items={snapshot.items}
      sheets={snapshot.samplingData?.sheets ?? []}
      editable={editable}
      onSaved={onRefetch}
    />
  </div>
);
