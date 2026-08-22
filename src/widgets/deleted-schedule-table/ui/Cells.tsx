import type { CellContext } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

import { SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE } from "@shared/config";
import type { ScheduleStatus } from "@shared/model";
import { StatusDot } from "@shared/ui/badges";
import { Button } from "@shared/ui/buttons";

import type { DeletedScheduleTableRow } from "../model/types";

export const TextCell = ({ getValue }: CellContext<DeletedScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

/** 삭제 시점에 보존된 상태. 삭제는 '측정예정'에서만 가능하므로 실제로는 대부분 측정예정이다. */
export const StatusCell = ({ getValue }: CellContext<DeletedScheduleTableRow, ScheduleStatus>) => {
  const status = getValue();
  return <StatusDot tone={SCHEDULE_STATUS_TONE[status]} label={SCHEDULE_STATUS_LABEL[status]} />;
};

/**
 * 행 복구 액션 셀. 콜백은 `useDataTable({ overrides: { meta } })` 이 주입한다
 * (`RowActionCell` 과 같은 방식).
 */
export const RestoreCell = ({ row, table }: CellContext<DeletedScheduleTableRow, unknown>) => (
  <Button
    type="button"
    size="sm"
    variant="outline"
    startIcon={RotateCcw}
    disabled={table.options.meta?.isRowActionPending}
    onClick={() => table.options.meta?.onRestore?.(row.original)}
  >
    복구
  </Button>
);
