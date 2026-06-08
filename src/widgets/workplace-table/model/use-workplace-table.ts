import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import type { Workplace, WorkplaceListItem } from '@entities/workplace';

import { defaultColumns } from '../model/columns';
import { toWorkplaceRows } from '../model/mapper';
import type { WorkplaceTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  workplaces: WorkplaceListItem[];
  onRowClick?: (workplace: Workplace) => void;
}

export const useWorkplaceTable = ({ workplaces, onRowClick }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailWorkplace, setDetailWorkplace] = useState<WorkplaceTableRow | null>(null);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 4 });

  const tableData = useMemo(() => workplaces.map(toWorkplaceRows), [workplaces]);

  const handleViewDetail = (row: WorkplaceTableRow) => {
    setDetailWorkplace(row);
    setDetailOpen(true);
  };

  const table = useReactTable({
    columns: defaultColumns,
    data: tableData,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: { onViewWorkplaceDetail: handleViewDetail },
  });

  const handleRowClick = onRowClick
    ? (row: WorkplaceTableRow) => {
        onRowClick({
          id: row.id,
          companyId: row.companyId,
          name: row.workplaceName,
          address: row.address,
          bizNumber: row.bizNumber,
        });
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,
    detailWorkplace,

    globalFilter, setGlobalFilter,
  };
};
