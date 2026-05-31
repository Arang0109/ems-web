import type { CellContext } from '@tanstack/react-table';

import type { StackTableRow } from '../model/types';
import { DetailViewButton } from '@shared/ui/table-ui';

export const CustomCell = ({ getValue }: CellContext<StackTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<StackTableRow, unknown>) => (
  <DetailViewButton path={`/stacks/${row.original.id}`} />
);
