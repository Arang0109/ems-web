import { useState, useMemo } from 'react';

import type { WorkplaceListItem } from '@entities/workplace';

import { defaultColumns } from '../model/columns';
import { toWorkplaceRows } from '../model/mapper';
import type { WorkplaceTableRow } from '../model/types';

import { useDataTable } from '@shared/model';

interface Props {
  workplaces: WorkplaceListItem[];
  onRowClick?: (workplace: WorkplaceListItem) => void;
}

export const useWorkplaceTable = ({ workplaces, onRowClick }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const tableData = useMemo(() => workplaces.map(toWorkplaceRows), [workplaces]);

  const handleRowClick = onRowClick
    ? (row: WorkplaceTableRow) => {
        const item = workplaces.find(w => w.id === row.id);
        if (item) onRowClick(item);
      }
    : undefined;

  // 상세 폼은 목록(WorkplaceListItem)이 아닌 상세(Workplace)를 요구하므로,
  // 그 행을 선택해 부모가 상세를 조회하게 한 뒤 모달을 연다.
  const handleViewDetail = (row: WorkplaceTableRow) => {
    handleRowClick?.(row);
    setDetailOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: 4,
    onViewDetail: handleViewDetail,
  });

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,

    globalFilter, setGlobalFilter,
  };
};
