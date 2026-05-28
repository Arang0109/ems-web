import type { CellContext } from '@tanstack/react-table';

import type { Company, ContractStatus } from '@entities/company';
import { STATUS_MAP } from '../model/constants';
import { BadgeWithIcon } from '@shared/ui/badges';
import { DetailViewButton } from '@shared/ui/table-ui';


const StatusBadge = ({ status }: { status: ContractStatus }) => {
  const { label, variant } = STATUS_MAP[status];
  return <BadgeWithIcon variant={variant} label={label} />;
};

export const CustomCell = ({ getValue }: CellContext<Company, string>) => (
  <span className="font-medium text-gray-800">{getValue()}</span>
);

export const StatusCell = ({ row }: CellContext<Company, unknown>) => (
  <StatusBadge status={row.original.status} />
);

export const PathCell = ({ row }: CellContext<Company, unknown>) => (
  <DetailViewButton path={`/companies/${row.original.id}`} />
);
