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

  const handleViewDetail = () => {
    setDetailOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: 4,
    onViewDetail: handleViewDetail,
  });

  const handleRowClick = onRowClick
    ? (row: WorkplaceTableRow) => {
        const item = workplaces.find(w => w.id === row.id);
        if (item) onRowClick(item);
      }
    : undefined;

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,

    globalFilter, setGlobalFilter,
  };
};
