import type { CellContext } from '@tanstack/react-table';
import { IconButton } from "@shared/ui/buttons";

import type { PollutantTableRow } from '../model/types';
import { FileSearchCorner } from "lucide-react";

export const CustomCell = ({ getValue }: CellContext<PollutantTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const ActionCell = ({ row, table }: CellContext<PollutantTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewPollutantDetail?.(row.original)}
  />
);