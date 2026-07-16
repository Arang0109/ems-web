import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell, StatusBadgeCell } from "../ui/Cells";
import type { ScheduleTableRow } from "./types";

const columnHelper = createColumnHelper<ScheduleTableRow>();

export const defaultColumns = [
  columnHelper.accessor('measureDate', {
    header: '측정일',
    cell: CustomCell,
  }),
  columnHelper.accessor('status', {
    header: '상태',
    cell: StatusBadgeCell,
  }),
  columnHelper.accessor('referenceNumber', {
    header: '관리번호',
    cell: CustomCell,
  }),
  columnHelper.accessor('measurementField', {
    header: '측정분야',
    cell: CustomCell,
  }),
  columnHelper.accessor('measurementType', {
    header: '측정용도',
    cell: CustomCell,
  }),
  columnHelper.accessor('clientName', {
    header: '의뢰기관',
    cell: CustomCell,
  }),
  columnHelper.accessor('stackName', {
    header: '측정시설',
    cell: CustomCell,
  }),
  columnHelper.accessor('teamName', {
    header: '팀',
    cell: CustomCell,
  }),
];
