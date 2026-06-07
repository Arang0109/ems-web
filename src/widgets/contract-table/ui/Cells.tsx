import type { CellContext } from "@tanstack/react-table";

import type { ContractTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
)

export const DateCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()} 일</span>
)