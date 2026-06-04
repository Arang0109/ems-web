import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell, ActionCell } from "../ui/Cells";
import type { CompanyTableRow } from "./types";

const columnHelper = createColumnHelper<CompanyTableRow>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
  }),
  columnHelper.accessor('representative', {
    header: '대표자명',
    cell: CustomCell,
  }),
  columnHelper.accessor('address', {
    header: '측정대행 의뢰기관 주소',
    cell: CustomCell,
  }),
  columnHelper.accessor('bizNumber', {
    header: '사업자등록번호',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ActionCell,
  }),
];