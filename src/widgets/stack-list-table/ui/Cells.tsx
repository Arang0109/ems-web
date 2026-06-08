import { useNavigate } from 'react-router-dom';
import type { CellContext } from '@tanstack/react-table';

import type { StackTableRow } from '../model/types';
import { DetailViewButton } from '@shared/ui/buttons';

export const CustomCell = ({ getValue }: CellContext<StackTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<StackTableRow, unknown>) => {
  const navigate = useNavigate();
  return <DetailViewButton onClick={() => navigate(`/stacks/${row.original.id}`)} />;
};
