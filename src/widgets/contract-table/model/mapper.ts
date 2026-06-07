import type { ContractTableResponse } from "@entities/contract";
import type { ContractTableRow } from "./types";

export const toContractRows = (row: ContractTableResponse): ContractTableRow => ({
  field: row.fields,
  companyName: row.companyName,
  workplaceName: row.workplaceName,
  contractName: row.contractName,
  taskPeriod: row.taskPeriod,
  contractStatus: row.contractStatus,
  contractDate: row.contractDate
})