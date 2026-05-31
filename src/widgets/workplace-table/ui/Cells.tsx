import type { CellContext } from '@tanstack/react-table';

import type { WorkplaceTableRow } from '../model/types';

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableRow, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);