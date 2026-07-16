import type { CellContext } from "@tanstack/react-table";
import { FileSearchCorner } from "lucide-react";

import { IconButton } from "@shared/ui/buttons";
import { BadgeWithIcon } from "@shared/ui/badges";
import { EQUIP_STATUS_LABEL } from "@shared/config";
import type { EquipStatus } from "@shared/model";

import type { EquipmentTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<EquipmentTableRow, string>) => (
  <span className="font-medium text-foreground">{getValue()}</span>
);

const STATUS_VARIANT: Record<EquipStatus, "contract" | "secondary" | "outline" | "destructive"> = {
  ACTIVE: 'contract',
  INACTIVE: 'secondary',
  MAINTENANCE: 'outline',
  DELETED: 'destructive',
};

export const StatusBadgeCell = ({ getValue }: CellContext<EquipmentTableRow, EquipStatus>) => {
  const status = getValue();
  return <BadgeWithIcon variant={STATUS_VARIANT[status]} label={EQUIP_STATUS_LABEL[status]} />;
};

export const ActionCell = ({ row, table }: CellContext<EquipmentTableRow, unknown>) => (
  <IconButton
    icon={<FileSearchCorner />}
    label="View Details"
    onClick={() => table.options.meta?.onViewEquipmentDetail?.(row.original)}
  />
);
