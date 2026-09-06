import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useStacks } from '@entities/stack';

import { defaultColumns } from './columns';
import { toStackRows } from './mapper';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useStackListTable = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, fetchStacks } = useStacks();

  // fetchStacks 는 참조가 고정돼 있어(useLazyFetch) 의존성에 넣어도 재조회 루프가 생기지 않는다.
  useEffect(() => {
    fetchStacks(null);
  }, [fetchStacks]);

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
