import { createColumnHelper } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";

import type { ScheduleCustomFieldTableRow } from "./types";

const columnHelper = createColumnHelper<ScheduleCustomFieldTableRow>();

export const defaultColumns = [
  columnHelper.accessor("label", {
    header: "이름",
  }),
  columnHelper.accessor("key", {
    header: "양식 이름",
    enableSorting: false,
  }),
  columnHelper.accessor("sortOrder", {
    header: "표시 순서",
    enableSorting: false,
  }),
  columnHelper.display({
    id: "actions",
    cell: RowActionCell,
  }),
];
