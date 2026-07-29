import type { CellContext } from "@tanstack/react-table";

import type { ContractTableRow } from "../model/types";
import { useNavigate } from "react-router-dom";
import { DetailViewButton } from "@/shared/ui/buttons/DetailViewButton";

export const CustomCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()}</span>
)

export const DateCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span className="text-body-4 text-foreground">{getValue()} 일</span>
)

export const PathCell = ({ row }: CellContext<ContractTableRow, unknown>) => {
  const navigate = useNavigate();
  return <DetailViewButton onClick={() => navigate(`/contracts/${row.original.id}`)} />;
};