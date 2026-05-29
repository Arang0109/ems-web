import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell } from "../ui/Cells";
import type { Company } from "@entities/company";

const columnHelper = createColumnHelper<Company>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '측정대행 의뢰기관',
    cell: CustomCell,
  }),
  columnHelper.accessor('ceoName', {
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
];