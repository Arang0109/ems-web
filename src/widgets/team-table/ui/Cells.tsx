import type { CellContext } from "@tanstack/react-table";
import { FileSearchCorner } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";

import type { TeamTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<TeamTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);

export const ActionCell = ({ row, table }: CellContext<TeamTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewTeamDetail?.(row.original)}
  />
);
