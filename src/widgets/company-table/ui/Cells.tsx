import type { CellContext } from "@tanstack/react-table";

import type { CompanyTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<CompanyTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);