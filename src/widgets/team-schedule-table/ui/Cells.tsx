import { useNavigate } from 'react-router-dom';
import type { CellContext } from '@tanstack/react-table';

import type { TeamScheduleTableRow } from '../model/types';
import { DetailViewButton } from '@shared/ui/buttons';

export const CustomCell = ({ getValue }: CellContext<TeamScheduleTableRow, string>) => (
  <span>{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<TeamScheduleTableRow, unknown>) => {
  const navigate = useNavigate();
  return <DetailViewButton onClick={() => navigate(`/schedules/${row.original.scheduleId}`)} />;
};
