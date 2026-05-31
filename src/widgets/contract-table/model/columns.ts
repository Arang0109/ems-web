import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell } from "../ui/Cells";
import type { ContractTableRow } from "./types";

const columnHelper = createColumnHelper<ContractTableRow>();

export const defaultColumns = [
  columnHelper.accessor('field', {
    header: '측정분야',
    cell: CustomCell,
  }),
  columnHelper.accessor('companyName', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
  }),
  columnHelper.accessor('workplaceName', {
    header: '측정대상 사업장',
    cell: CustomCell,
  }),
  columnHelper.accessor('contractName', {
    header: '용역명',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('contractDate', {
    header: '계약일',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('taskPeriod', {
    header: '과업기간',
    cell: CustomCell,
    enableSorting: false,
  }),
];