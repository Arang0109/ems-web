import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStacks } from '@entities/stack';

import { defaultColumns } from './columns';
import { toStackRows } from './mapper';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useStackListTable = () => {
  const navigate = useNavigate();
  // null 은 필터 없는 전체 목록이다.
  const { data, isLoading, error } = useStacks(null);

  const tableData = useMemo(() => data.map(toStackRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: (row) => navigate(`/stacks/${row.id}`),
  });

  return {
    table,
    isLoading, error,
    globalFilter, setGlobalFilter,
  };
};
