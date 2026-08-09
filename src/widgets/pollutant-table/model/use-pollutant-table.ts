import { useState, useMemo } from 'react';

import { usePollutants } from '@entities/pollutant';

import { defaultColumns } from '../model/columns';
import { toPollutantRow } from '../model/mapper';
import type { PollutantTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

export const usePollutantTable = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  // 상세 모달은 후속 작업 — 선택된 행만 보관해 둔다
  const [detailPollutant, setDetailPollutant] = useState<PollutantTableRow | null>(null);

  const { data, loading, error, refetch } = usePollutants();

  const tableData = useMemo(() => data.map(toPollutantRow), [data]);

  const handleViewDetail = (row: PollutantTableRow) => {
    setDetailPollutant(row);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: handleViewDetail,
  });

  return {
    table,

    registerModalOpen, setRegisterModalOpen,
    detailPollutant,

    globalFilter, setGlobalFilter,

    refetch,

    loading, error,
  };
};
