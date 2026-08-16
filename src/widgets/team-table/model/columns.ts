import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell } from "../ui/Cells";
import type { TeamTableRow } from "./types";
import { RowActionCell } from "@shared/ui/table"

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
    cell: RowActionCell,
  }),
];
