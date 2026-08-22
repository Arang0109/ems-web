import type { CellContext } from '@tanstack/react-table';

import type { StackTableRow } from '../model/types';

export const CustomCell = ({ getValue }: CellContext<StackTableRow, string>) => (
  <span>{getValue()}</span>
);
