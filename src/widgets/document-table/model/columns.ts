import { createColumnHelper } from "@tanstack/react-table";
import type { RowData } from "@tanstack/react-table";

import { RowActionCell } from "@shared/ui/table";

import { CustomCell, DownloadCell } from "../ui/Cells";
import type { DocumentTableRow, DocumentVersionTableRow } from "./types";

// 다운로드 콜백은 이 파일에서만 선언한다(version-columns.ts는 선언 없이 사용).
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    onDownloadDocument?: (row: DocumentTableRow) => void;
    onDownloadDocumentVersion?: (row: DocumentVersionTableRow) => void;
  }
}

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
