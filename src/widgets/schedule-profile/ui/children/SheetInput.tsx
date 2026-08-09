import type { ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { SheetsEditor } from "@features/save-schedule-sheets";

interface Props {
  scheduleId: number | null;
  snapshot: ScheduleSnapshot | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetInput = ({ scheduleId, snapshot, editable, externals, onSaved }: Props) => (
  <SheetsEditor
    scheduleId={scheduleId}
    snapshot={snapshot}
    editable={editable}
    externals={externals}
    onSaved={onSaved}
  />
);
