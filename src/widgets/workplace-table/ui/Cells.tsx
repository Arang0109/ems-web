import type { CellContext } from '@tanstack/react-table';

import type { WorkplaceTableRow } from '../model/types';

export const CustomCell = ({ getValue }: CellContext<WorkplaceTableRow, string>) => (
  <span>{getValue()}</span>
);
