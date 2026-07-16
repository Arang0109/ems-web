import type { CellContext } from "@tanstack/react-table";
import { IconButton } from "@shared/ui/buttons";

import type { MemberTableRow } from "../model/types";
import { FileSearchCorner } from "lucide-react";

export const CustomCell = ({ getValue }: CellContext<MemberTableRow, string>) => (
  <span className="font-medium text-foreground">{getValue()}</span>
);

export const ActionCell = ({ row, table }: CellContext<MemberTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewMemberDetail?.(row.original)}
  />
);
