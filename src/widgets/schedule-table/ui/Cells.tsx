import type { CellContext } from "@tanstack/react-table";

import { StatusDot, type StatusTone } from "@shared/ui/badges";
import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import type { ScheduleStatus } from "@shared/model";

import type { ScheduleTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<ScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

/** 측정중·분석중은 같은 progress 톤이며 텍스트로 구분한다(색상만으로 구분하지 않는다). */
const STATUS_TONE_MAP: Record<ScheduleStatus, StatusTone> = {
  SCHEDULED: 'pending',
  MEASURING: 'progress',
  ANALYZING: 'progress',
  COMPLETED: 'done',
  CANCELED: 'danger',
};

export const StatusBadgeCell = ({ getValue }: CellContext<ScheduleTableRow, ScheduleStatus>) => {
  const status = getValue();
  return <StatusDot tone={STATUS_TONE_MAP[status]} label={SCHEDULE_STATUS_LABEL[status]} />;
};

/** 모바일 카드 헤더 상태 — 피그마 상태 칩(알약 형태). 카드 설정에서 값으로 직접 쓴다. */
export const StatusPill = ({ status }: { status: ScheduleStatus }) => (
  <StatusDot pill tone={STATUS_TONE_MAP[status]} label={SCHEDULE_STATUS_LABEL[status]} />
);
