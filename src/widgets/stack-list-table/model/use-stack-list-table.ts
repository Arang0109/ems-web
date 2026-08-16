import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStacks } from '@entities/stack';

import { defaultColumns } from './columns';
import { toStackRows } from './mapper';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useStackListTable = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchStacks } = useStacks();

  useEffect(() => {
    fetchStacks(null);
  }, []);

  const tableData = useMemo(() => data.map(toStackRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: (row) => navigate(`/stacks/${row.id}`),
  });

  return {
    table,
    loading, error,
    globalFilter, setGlobalFilter,
  };
};
