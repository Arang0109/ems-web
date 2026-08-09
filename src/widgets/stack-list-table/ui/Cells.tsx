import { useNavigate } from 'react-router-dom';
import type { CellContext } from '@tanstack/react-table';

import type { StackTableRow } from '../model/types';
import { Button } from '@shared/ui/buttons';
import { Ellipsis } from 'lucide-react';

export const CustomCell = ({ getValue }: CellContext<StackTableRow, string>) => (
  <span>{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<StackTableRow, unknown>) => {
  const navigate = useNavigate();
  return <Button
    variant="outline"
    onClick={() => navigate(`/stacks/${row.original.id}`)}
    startIcon={Ellipsis}
  >상세보기</Button>;
};
