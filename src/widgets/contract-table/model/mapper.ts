import type { ContractTableListResponse } from "@entities/contract";
import type { ContractTableRow } from "./types";

import { MEASUREMENT_FIELD_LABEL } from "@shared/model";

export const toContractRows = (row: ContractTableListResponse): ContractTableRow => ({
  field: MEASUREMENT_FIELD_LABEL[row.field],
  companyName: row.companyName,
  workplaceName: row.workplaceName,
  contractName: row.contractName,
  taskPeriod: row.taskPeriod,
  contractStatus: row.contractStatus,
  contractDate: row.contractDate
})