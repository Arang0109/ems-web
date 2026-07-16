import type { ContractListItem } from "@entities/contract";
import type { ContractTableRow } from "./types";

export const toContractRows = (row: ContractListItem): ContractTableRow => ({
  id: row.id,
  workplaceId: row.workplaceId,
  field: row.fields,
  clientName: row.clientName,
  workplaceName: row.workplaceName,
  contractName: row.contractName,
  taskPeriod: row.taskPeriod,
  contractStatus: row.contractStatus,
  contractDate: row.contractDate,
});