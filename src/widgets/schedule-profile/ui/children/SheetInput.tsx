import type { ScheduleStatus } from "@shared/model";
import type { ScheduleDetail, ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { SheetsEditor } from "@features/save-schedule-sheets";

interface Props {
  scheduleId: number | null;
  /** 기록지 미리보기가 쓰는 계획 메타(관리번호·채취일자) — 스냅샷에는 사본이 없다. */
  schedule: ScheduleDetail | null;
  snapshot: ScheduleSnapshot | null;
  // 저장 전후 상태 비교용. 스냅샷의 사본이 아니라 응답 최상위(메타)를 쓴다 — 그쪽이 진실의 원천이다.
  status: ScheduleStatus | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetInput = ({
  scheduleId, schedule, snapshot, status, editable, externals, onSaved,
}: Props) => (
  <SheetsEditor
    scheduleId={scheduleId}
    schedule={schedule}
    snapshot={snapshot}
    status={status}
    editable={editable}
    externals={externals}
    onSaved={onSaved}
  />
);
