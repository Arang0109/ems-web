import type { Equipment } from "@entities/equipment";
import { formatMoney } from "@shared/lib";

import type { EquipmentTableRow } from "./types";

export const toEquipmentRows = (col: Equipment): EquipmentTableRow => ({
  id: col.id,
  managementNumber: col.managementNumber,
  equipmentName: col.equipmentName,
  modelName: col.modelName,
  manufacturer: col.manufacturer,
  price: formatMoney(col.price),
  status: col.status,
});
