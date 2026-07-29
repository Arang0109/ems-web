import type { CellContext } from "@tanstack/react-table";
import { FileSearchCorner } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";
import { StatusDot, type StatusTone } from "@shared/ui/badges";
import { EQUIP_STATUS_LABEL } from "@shared/config";
import type { EquipStatus } from "@shared/model";

import type { EquipmentTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<EquipmentTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);

const STATUS_TONE_MAP: Record<EquipStatus, StatusTone> = {
  ACTIVE: 'progress',
  INACTIVE: 'done',
  MAINTENANCE: 'warning',
  DELETED: 'danger',
};

export const StatusBadgeCell = ({ getValue }: CellContext<EquipmentTableRow, EquipStatus>) => {
  const status = getValue();
  return <StatusDot tone={STATUS_TONE_MAP[status]} label={EQUIP_STATUS_LABEL[status]} />;
};

export const ActionCell = ({ row, table }: CellContext<EquipmentTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewEquipmentDetail?.(row.original)}
  />
);
