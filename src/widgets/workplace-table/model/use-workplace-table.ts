import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import type { WorkplaceListItem } from '@entities/workplace';

import { defaultColumns } from '../model/columns';
import { toWorkplaceRows } from '../model/mapper';
import type { WorkplaceTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  workplaces: WorkplaceListItem[];
  onRowClick?: (workplace: WorkplaceListItem) => void;
}

export const useWorkplaceTable = ({ workplaces, onRowClick }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 4 });

  const tableData = useMemo(() => workplaces.map(toWorkplaceRows), [workplaces]);

  const handleViewDetail = () => {
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
        const item = workplaces.find(w => w.id === row.id);
        if (item) onRowClick(item);
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,

    globalFilter, setGlobalFilter,
  };
};
