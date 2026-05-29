import type { CellContext } from "@tanstack/react-table";

import type { Company } from "@entities/company";

export const CustomCell = ({ getValue }: CellContext<Company, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
)