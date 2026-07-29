import type { MeasurementSheet, ScheduleSnapshot, SheetCalcExternals } from "@entities/schedule";
import { SheetsEditor } from "@features/save-schedule-sheets";

interface Props {
  scheduleId: number | null;
  sheets: MeasurementSheet[];
  snapshot: ScheduleSnapshot | null;
  editable: boolean;
  externals: SheetCalcExternals;
  onSaved?: () => void;
}

export const SheetInput = ({ scheduleId, sheets, snapshot, editable, externals, onSaved }: Props) => (
  <SheetsEditor
    scheduleId={scheduleId}
    initialSheets={sheets}
    snapshot={snapshot}
    editable={editable}
    externals={externals}
    onSaved={onSaved}
  />
);
