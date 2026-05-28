import type { CellContext } from '@tanstack/react-table';

import type { Company } from '@entities/company';
import type { ActiveStatus } from '@shared/model';
import { Badge } from '@shared/ui/badges';

import { STATUS_MAP } from '../model/types';

const StatusBadge = ({ status }: { status: ActiveStatus }) => {
  const { label, className } = STATUS_MAP[status];
  return <Badge className={className}>{label}</Badge>;
};

export const CustomCell = ({ getValue }: CellContext<Company, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const StatusCell = ({ row }: CellContext<Company, unknown>) => (
  <StatusBadge status={row.original.status} />
);
