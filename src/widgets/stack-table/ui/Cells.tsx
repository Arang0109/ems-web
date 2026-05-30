import type { CellContext } from '@tanstack/react-table';

import type { StackTableCols } from '../model/stack-table-types';
import { DetailViewButton } from '@shared/ui/table-ui';

export const CustomCell = ({ getValue }: CellContext<StackTableCols, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const PathCell = ({ row }: CellContext<StackTableCols, unknown>) => (
  <DetailViewButton path={`/stacks/${row.original.id}`} />
);