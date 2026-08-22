import type { ContractListItem } from "@entities/contract";
import { MEASUREMENT_FIELD_LABEL } from "@shared/config";
import { formatDate } from "@shared/lib";
import type { MeasurementField } from "@shared/model";
import type { ContractTableRow } from "./types";

const toFieldLabels = (fields: string): string =>
  fields
    ? fields
        .split(",")
        .map((f) => MEASUREMENT_FIELD_LABEL[f.trim() as MeasurementField] ?? f)
        .join(", ")
    : "";

export const toContractRows = (row: ContractListItem): ContractTableRow => ({
  id: row.id,
  workplaceId: row.workplaceId,
  field: toFieldLabels(row.fields),
  clientName: row.clientName,
  workplaceName: row.workplaceName,
  contractName: row.contractName,
  taskPeriod: row.taskPeriod,
  contractStatus: row.contractStatus,
  contractDate: formatDate(row.contractDate),
});