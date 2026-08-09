import type { CellContext } from "@tanstack/react-table";

import type { ContractTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span>{getValue()}</span>
)

export const DateCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span>{getValue()} 일</span>
)
