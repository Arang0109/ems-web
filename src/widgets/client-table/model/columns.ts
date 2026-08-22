import { createColumnHelper } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";

import type { ClientTableRow } from "./types";

const columnHelper = createColumnHelper<ClientTableRow>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '측정대행 의뢰기관',
  }),
  columnHelper.accessor('representative', {
    header: '대표자명',
  }),
  columnHelper.accessor('address', {
    header: '측정대행 의뢰기관 주소',
  }),
  columnHelper.accessor('bizNumber', {
    header: '사업자번호',
  }),
  columnHelper.display({
    id: 'actions',
    size: 10,
    header: '비고',
    cell: RowActionCell,
  }),
];
