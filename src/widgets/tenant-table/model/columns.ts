import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell } from "../ui/Cells";
import type { TenantTableRow } from "./types";

const columnHelper = createColumnHelper<TenantTableRow>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '고객사명',
    cell: CustomCell,
  }),
  columnHelper.accessor('bizNumber', {
    header: '사업자번호',
    cell: CustomCell,
  }),
  columnHelper.accessor('subscriptionPlan', {
    header: '요금제',
    cell: CustomCell,
  }),
  columnHelper.accessor('status', {
    header: '상태',
    cell: CustomCell,
  }),
  columnHelper.accessor('createdAt', {
    header: '발급일',
    cell: CustomCell,
  }),
];
