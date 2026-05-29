import type { CellContext } from '@tanstack/react-table';

import type { WorkplaceTableD } from '@entities/workplace';
import { DetailViewButton } from '@shared/ui/table-ui';

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableD, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<WorkplaceTableD, unknown>) => (
  <DetailViewButton path={`/workplaces/${row.original.id}`} />
);