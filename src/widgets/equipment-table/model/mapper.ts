import type { Equipment } from "@entities/equipment";
import { formatNumber } from "@shared/lib";

import type { EquipmentTableRow } from "./types";

export const toEquipmentRows = (col: Equipment): EquipmentTableRow => ({
  id: col.id,
  managementNumber: col.managementNumber,
  equipmentName: col.equipmentName,
  modelName: col.modelName,
  manufacturer: col.manufacturer,
  price: formatNumber(col.price),
  status: col.status,
});
