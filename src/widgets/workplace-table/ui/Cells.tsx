import type { CellContext } from '@tanstack/react-table';

import type { WorkplaceTableCols } from '../model/workplace-table-types';

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableCols, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);