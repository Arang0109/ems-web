import type { CellContext } from "@tanstack/react-table";

import type { MemberTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<MemberTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);