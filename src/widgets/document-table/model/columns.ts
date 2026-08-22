import { createColumnHelper } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";

import { CustomCell, DownloadCell } from "../ui/Cells";
import type { DocumentTableRow } from "./types";

const columnHelper = createColumnHelper<DocumentTableRow>();

export const defaultColumns = [
  columnHelper.accessor('name', {
    header: '문서명',
    cell: CustomCell,
  }),
  columnHelper.accessor('category', {
    header: '분류',
    cell: CustomCell,
  }),
  columnHelper.accessor('description', {
    header: '설명',
    cell: CustomCell,
  }),
  columnHelper.accessor('latestVersion', {
    header: '최신 버전',
    cell: CustomCell,
  }),
  columnHelper.accessor('modifiedAt', {
    header: '수정일',
    cell: CustomCell,
  }),
  columnHelper.display({
    id: 'download',
    cell: DownloadCell,
  }),
  columnHelper.display({
    id: 'actions',
    cell: RowActionCell,
  }),
];
