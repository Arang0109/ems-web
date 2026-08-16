import { useState, useMemo } from 'react';

import { usePollutants } from '@entities/pollutant';

import { defaultColumns } from '../model/columns';
import { toPollutantRow } from '../model/mapper';
import type { PollutantTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  onSuccess?: () => void;
}

export const usePollutantTable = ({ onSuccess }: Props = {}) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  /** 상세 모달 대상 — 상세보기를 누른(또는 클릭한) 행이다. */
  const [detailPollutantId, setDetailPollutantId] = useState<number | null>(null);

  const { data, loading, error, refetch: pollutantRefetch } = usePollutants();

  const tableData = useMemo(() => data.map(toPollutantRow), [data]);

  // Row 는 표시용 포맷 값이라 폼 초기값으로 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 refetch 이후에도 모달이 최신 값을 따른다.
  const detailPollutant = useMemo(
    () => data.find((pollutant) => pollutant.id === detailPollutantId) ?? null,
    [data, detailPollutantId],
  );

  const refetch = () => {
    pollutantRefetch();
    onSuccess?.();
  };

  const handleViewDetail = (row: PollutantTableRow) => {
    setDetailPollutantId(row.id);
    setUpdateModalOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: handleViewDetail,
  });

  return {
    table,

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    updateModalOpen, setUpdateModalOpen,
    detailPollutant,

    globalFilter, setGlobalFilter,

    refetch,

    loading, error,
  };
};
