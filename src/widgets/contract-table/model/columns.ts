import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell, DateCell, PathCell } from "../ui/Cells";
import type { ContractTableRow } from "./types";

const columnHelper = createColumnHelper<ContractTableRow>();

export const defaultColumns = [
  columnHelper.accessor('field', {
    header: '측정분야',
    cell: CustomCell,
    enableSorting: false,
  }),
  columnHelper.accessor('clientName', {
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
  }),
  columnHelper.accessor('contractDate', {
    header: '계약일',
    cell: CustomCell,
  }),
  columnHelper.accessor('taskPeriod', {
    header: '과업기간',
    cell: DateCell,
    enableSorting: false,
  }),
  columnHelper.display({
    header: '상세보기',
    cell: PathCell,
  }),
];