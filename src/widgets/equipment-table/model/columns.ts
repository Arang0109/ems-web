import { createColumnHelper } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

import { CustomCell, StatusBadgeCell, ActionCell } from "../ui/Cells";
import type { EquipmentTableRow } from "./types";

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onViewEquipmentDetail?: (row: EquipmentTableRow) => void;
  }
}

const columnHelper = createColumnHelper<EquipmentTableRow>();

export const defaultColumns = [
  columnHelper.accessor('managementNumber', {
    header: '관리번호',
    cell: CustomCell,
  }),
  columnHelper.accessor('equipmentName', {
    header: '장비명',
    cell: CustomCell,
  }),
  columnHelper.accessor('modelName', {
    header: '모델명',
    cell: CustomCell,
  }),
  columnHelper.accessor('manufacturer', {
    header: '제조사',
    cell: CustomCell,
  }),
  columnHelper.accessor('price', {
    header: '가격',
    cell: CustomCell,
  }),
  columnHelper.accessor('status', {
    header: '상태',
    cell: StatusBadgeCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: ActionCell,
  }),
];
