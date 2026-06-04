import type { CellContext } from '@tanstack/react-table';
import { IconButton } from "@shared/ui/buttons";

import type { WorkplaceTableRow } from '../model/types';
import { FileSearchCorner } from "lucide-react";

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const ActionCell = ({ row }: CellContext<WorkplaceTableRow, unknown>) => (
  <IconButton icon={<FileSearchCorner />} label="View Details" onClick={() => alert(`Open modal for ${row.original.workplaceName}`)} />
);