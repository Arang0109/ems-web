import { createColumnHelper } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";
import { CustomCell } from "../ui/Cells";
import type { MemberTableRow } from "./types";

const columnHelper = createColumnHelper<MemberTableRow>();

export const defaultColumns = [
  columnHelper.accessor('username', {
    header: '아이디',
    cell: CustomCell,
  }),
  columnHelper.accessor('name', {
    header: '이름',
    cell: CustomCell,
  }),
  columnHelper.accessor('role', {
    header: '역할',
    cell: CustomCell,
  }),
  columnHelper.accessor('department', {
    header: '부서',
    cell: CustomCell,
  }),
  columnHelper.accessor('email', {
    header: '이메일',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: RowActionCell,
  }),
];
