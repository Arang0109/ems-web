import type { CellContext } from "@tanstack/react-table";

import type { TenantTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<TenantTableRow, string>) => (
  <span className="font-medium text-foreground">{getValue()}</span>
);
