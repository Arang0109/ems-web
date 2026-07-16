import { createColumnHelper } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

import { CustomCell, ActionCell } from "../ui/Cells";
import type { MemberTableRow } from "./types";

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onViewMemberDetail?: (row: MemberTableRow) => void;
  }
}

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
    cell: ActionCell,
  }),
];
