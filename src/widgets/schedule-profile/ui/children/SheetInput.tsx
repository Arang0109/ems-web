import type { MeasurementSheet } from "@entities/schedule";
import { SheetsEditor } from "@features/save-schedule-sheets";

interface Props {
  scheduleId: number | null;
  sheets: MeasurementSheet[];
  editable: boolean;
  onSaved?: () => void;
}

export const SheetInput = ({ scheduleId, sheets, editable, onSaved }: Props) => (
  <SheetsEditor scheduleId={scheduleId} initialSheets={sheets} editable={editable} onSaved={onSaved} />
);
