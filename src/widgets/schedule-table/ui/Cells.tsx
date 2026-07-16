import type { CellContext } from "@tanstack/react-table";

import { BadgeWithIcon } from "@shared/ui/badges";
import { SCHEDULE_STATUS_LABEL } from "@shared/config";
import type { ScheduleStatus } from "@shared/model";

import type { ScheduleTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<ScheduleTableRow, string>) => (
  <span className="font-medium text-foreground">{getValue()}</span>
);

const STATUS_VARIANT: Record<ScheduleStatus, "contract" | "secondary" | "outline" | "destructive" | "default"> = {
  SCHEDULED: 'outline',
  MEASURING: 'secondary',
  ANALYZING: 'default',
  COMPLETED: 'contract',
  CANCELED: 'destructive',
};

export const StatusBadgeCell = ({ getValue }: CellContext<ScheduleTableRow, ScheduleStatus>) => {
  const status = getValue();
  return <BadgeWithIcon variant={STATUS_VARIANT[status]} label={SCHEDULE_STATUS_LABEL[status]} />;
};
