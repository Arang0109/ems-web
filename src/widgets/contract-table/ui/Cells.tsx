import type { CellContext } from "@tanstack/react-table";

import type { ContractTableRow } from "../model/types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/buttons/Button";
import { Ellipsis } from "lucide-react";

export const CustomCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span>{getValue()}</span>
)

export const DateCell = ({ getValue }: CellContext<ContractTableRow, string>) => (
  <span>{getValue()} 일</span>
)

export const PathCell = ({ row }: CellContext<ContractTableRow, unknown>) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="outline"
      onClick={() => navigate(`/stacks/${row.original.id}`)}
      startIcon={Ellipsis}
    >상세보기</Button>
  );
};