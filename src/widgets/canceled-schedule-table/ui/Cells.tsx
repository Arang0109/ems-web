import type { CellContext } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { Button } from "@shared/ui/buttons";

import type { CanceledScheduleTableRow } from "../model/types";

export const TextCell = ({ getValue }: CellContext<CanceledScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

/** 취소 사유는 길어질 수 있어 한 줄로 자르고 전문은 툴팁으로 보여 준다. */
export const ReasonCell = ({ getValue }: CellContext<CanceledScheduleTableRow, string>) => {
  const reason = getValue();
  return <span className="block truncate" title={reason}>{reason}</span>;
};

/**
 * 행 삭제 액션 셀. 콜백은 `useDataTable({ overrides: { meta } })` 이 주입한다
 * (`deleted-schedule-table` 의 `RestoreCell` 과 같은 방식).
 */
export const DeleteCell = ({ row, table }: CellContext<CanceledScheduleTableRow, unknown>) => (
  <Button
    type="button"
    size="sm"
    variant="outline"
    startIcon={Trash2}
    disabled={table.options.meta?.isRowActionPending}
    onClick={() => table.options.meta?.onDelete?.(row.original)}
  >
    삭제
  </Button>
);
