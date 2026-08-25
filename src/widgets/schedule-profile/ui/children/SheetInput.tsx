import type { ScheduleStatus } from "@shared/model";
import type { ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { SheetsEditor } from "@features/save-schedule-sheets";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  // 저장 전후 상태 비교용. 스냅샷의 사본이 아니라 응답 최상위(메타)를 쓴다 — 그쪽이 진실의 원천이다.
  status: ScheduleStatus | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetInput = ({ scheduleId, snapshot, status, editable, externals, onSaved }: Props) => (
  <SheetsEditor
    scheduleId={scheduleId}
    snapshot={snapshot}
    status={status}
    editable={editable}
    externals={externals}
    onSaved={onSaved}
  />
);
