import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import { usePollutants } from '@entities/pollutant';

import { defaultColumns } from '../model/columns';
import { toPollutantRow } from '../model/mapper';

import { useTableState } from '@shared/model';

export const usePollutantTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 4 });

  const { data, loading, error, refetch } = usePollutants();

  const tableData = useMemo(() => data.map(toPollutantRow), [data]);

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
  });

  return {
    table,

    registerModalOpen, setRegisterModalOpen,
    
    refetch,
    
    loading, error,
  };
};
