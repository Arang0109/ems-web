import type { CellContext } from '@tanstack/react-table';
import { IconButton } from "@shared/ui/buttons";

import type { WorkplaceTableRow } from '../model/types';
import { FileSearchCorner } from "lucide-react";

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);

export const ActionCell = ({ row, table }: CellContext<WorkplaceTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewWorkplaceDetail?.(row.original)}
  />
);