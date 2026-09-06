import { createColumnHelper } from "@tanstack/react-table";

import { VersionCustomCell, VersionDeleteCell, VersionDownloadCell } from "../ui/Cells";
import type { DocumentVersionTableRow } from "./types";

const columnHelper = createColumnHelper<DocumentVersionTableRow>();

export const versionColumns = [
  columnHelper.accessor('version', {
    header: '버전',
    cell: VersionCustomCell,
    size: 10,
  }),
  columnHelper.accessor('originalFilename', {
    header: '파일명',
    cell: VersionCustomCell,
  }),
  columnHelper.accessor('size', {
    header: '크기',
    cell: VersionCustomCell,
    size: 10,
  }),
  columnHelper.accessor('changeNote', {
    header: '변경 사유',
    cell: VersionCustomCell,
  }),
  columnHelper.accessor('createdAt', {
    header: '업로드일',
    cell: VersionCustomCell,
  }),
  columnHelper.display({
    id: 'download',
    cell: VersionDownloadCell,
    size: 10,
  }),
  columnHelper.display({
    id: 'delete',
    cell: VersionDeleteCell,
    size: 10,
  }),
];
