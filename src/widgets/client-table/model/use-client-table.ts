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
  /** 상세 모달 대상 — 행 클릭으로 선택된 항목이 아니라 '상세보기' 를 누른 행이다. */
  const [detailClientId, setDetailClientId] = useState<number | null>(null);

  const { data, isLoading: loading, error, refetch: clientRefetch } = useClients();

  const tableData = useMemo(() => data.map(toClientRows), [data]);

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 refetch 이후에도 모달이 최신 값을 따른다.
  const detailClient = useMemo(
    () => data.find((client) => client.id === detailClientId) ?? null,
    [data, detailClientId],
  );

  const handleViewDetail = (row: ClientTableRow) => {
    setDetailClientId(row.id);
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
    detailClient,

    globalFilter, setGlobalFilter,

    isLoading: loading, error, refetch,
  }
}
