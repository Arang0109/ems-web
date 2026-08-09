import { useState, useMemo } from 'react';

import { useClients } from '@entities/client';

import { defaultColumns } from '../model/columns';
import { toClientRows } from '../model/mapper';
import type { ClientTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  onRowClick: (clientId: number) => void;
  onSuccess?: () => void;
}

export const useClientTable = ({ onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const { data, loading, error, refetch: clientRefetch } = useClients();

  const tableData = useMemo(() => data.map(toClientRows), [data]);

  const handleViewDetail = () => {
    setUpdateModalOpen(true);
  };

  const refetch = () => {
    clientRefetch();
    onSuccess?.();
  }

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.COMPACT,
    onViewDetail: handleViewDetail,
  });

  const handleRowClick = onRowClick
    ? (row: ClientTableRow) => {
        onRowClick(row.id);
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  }
}
