import type { CellContext } from "@tanstack/react-table";

import { StatusDot } from "@shared/ui/badges";
import { SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE } from "@shared/config";
import type { ScheduleStatus } from "@shared/model";

import type { ScheduleTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<ScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

export const StatusBadgeCell = ({ getValue }: CellContext<ScheduleTableRow, ScheduleStatus>) => {
  const status = getValue();
  return <StatusDot tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} />;
};

/** 모바일 카드 헤더 상태 — 피그마 상태 칩(알약 형태). 카드 설정에서 값으로 직접 쓴다. */
export const StatusPill = ({ status }: { status: ScheduleStatus }) => (
  <StatusDot pill tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} className="text-body-3" />
);
