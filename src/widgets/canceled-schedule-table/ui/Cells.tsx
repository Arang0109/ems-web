import type { CellContext } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { Button } from "@shared/ui/buttons";

import type { CanceledScheduleTableRow } from "../model/types";

export const TextCell = ({ getValue }: CellContext<CanceledScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

/** 행 삭제 액션 셀. 콜백은 `useDataTable({ overrides: { meta } })` 이 주입한다. */
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
