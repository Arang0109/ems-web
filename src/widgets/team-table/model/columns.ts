import { createColumnHelper } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

import { CustomCell, ActionCell } from "../ui/Cells";
import type { TeamTableRow } from "./types";

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onViewTeamDetail?: (row: TeamTableRow) => void;
  }
}

const columnHelper = createColumnHelper<TeamTableRow>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '팀 이름',
    cell: CustomCell,
  }),
  columnHelper.accessor('mentorName', {
    header: '사수',
    cell: CustomCell,
  }),
  columnHelper.accessor('menteeName', {
    header: '부사수',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ActionCell,
  }),
];
