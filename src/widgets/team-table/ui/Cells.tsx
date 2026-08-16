import type { CellContext } from "@tanstack/react-table";
import type { TeamTableRow } from "../model/types";

export const CustomCell = ({ getValue }: CellContext<TeamTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
);
