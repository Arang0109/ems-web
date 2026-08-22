import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import type { StackListItem } from '@entities/stack';

import { defaultColumns } from '../model/columns';
import { toStackRows } from '../model/mapper';

import { useDataTable } from '@shared/model';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  stacks: StackListItem[];
}

export const useStackTable = ({ stacks }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const navigate = useNavigate();

  const tableData = useMemo(() => stacks.map(toStackRows), [stacks]);

  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.DEFAULT,
    onViewDetail: (row) => navigate(`/stacks/${row.id}`),
  });

  return {
    table,

    registerModalOpen, setRegisterModalOpen,

    globalFilter, setGlobalFilter,
  };
};
