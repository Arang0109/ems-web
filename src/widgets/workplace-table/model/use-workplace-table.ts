import { useState, useMemo } from 'react';

import {
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';

import type { Company } from '@entities/company';
import type { Workplace, WorkplaceListItem } from '@entities/workplace';
import { useWorkplaceAction } from '@entities/workplace';

import { defaultColumns } from '../model/columns';
import { toWorkplaceRows, toWorkplaceUpdateRequest } from '../model/mapper';
import type { WorkplaceDetailFormData, WorkplaceTableRow } from '../model/types';

import { useTableState } from '@shared/model';

interface Props {
  data: WorkplaceListItem[];
  selectedCompany: Company | null;
  onRowClick?: (workplace: Workplace) => void;
  onSuccess?: () => void;
}

export const useWorkplaceTable = ({ data, selectedCompany, onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailWorkplace, setDetailWorkplace] = useState<WorkplaceTableRow | null>(null);

  const {
    sorting, setSorting,
    globalFilter, setGlobalFilter,
    pagination, setPagination,
  } = useTableState({ pageSize: 4 });

  const { handleEdit: editWorkplace, handleDelete: deleteWorkplace } = useWorkplaceAction({ onSuccess });

  const tableData = useMemo(() => data.map(toWorkplaceRows), [data]);

  const handleViewDetail = (row: WorkplaceTableRow) => {
    setDetailWorkplace(row);
    setDetailOpen(true);
  };

  const handleEdit = (formData: WorkplaceDetailFormData) => {
    if (!detailWorkplace) return;
    editWorkplace(detailWorkplace.id, toWorkplaceUpdateRequest(formData));
    setDetailOpen(false);
  };

  const handleDelete = () => {
    if (!detailWorkplace) return;
    deleteWorkplace(detailWorkplace.id);
    setDetailOpen(false);
  };

  const table = useReactTable({
    columns: defaultColumns,
    data: tableData,

    state: { sorting, globalFilter, pagination },

    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: { onViewWorkplaceDetail: handleViewDetail },
  });

  const handleRowClick = onRowClick
    ? (row: WorkplaceTableRow) => {
        onRowClick({
          id: row.id,
          companyId: row.companyId,
          name: row.workplaceName,
          address: row.address,
          bizNumber: row.bizNumber,
        });
      }
    : undefined;

  return {
    table,
    handleRowClick,
    handleEdit,
    handleDelete,
    registerModalOpen, setRegisterModalOpen,
    detailOpen, setDetailOpen,
    detailWorkplace,
  };
};
