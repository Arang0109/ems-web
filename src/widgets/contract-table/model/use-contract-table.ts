import { useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

import { useContracts } from '@entities/contract';

import { defaultColumns } from '../model/columns';
import { toContractRows } from '../model/mapper';
import type { ContractTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const useContractTable = () => {
  const navigate = useNavigate();

  const { data, loading, error } = useContracts();
  const tableData = useMemo(() => data.map(toContractRows), [data]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.WIDE,
    onViewDetail: (row: ContractTableRow) => navigate(`/contracts/${row.id}`),
  });

  return { table, loading, error, globalFilter, setGlobalFilter };
};
