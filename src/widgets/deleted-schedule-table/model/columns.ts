import { createColumnHelper } from "@tanstack/react-table";

import { RestoreCell, StatusCell, TextCell } from "../ui/Cells";
import type { DeletedScheduleTableRow } from "./types";

const columnHelper = createColumnHelper<DeletedScheduleTableRow>();

/** 복구 콜백은 컬럼이 아니라 `table.options.meta` 로 주입된다(`RestoreCell` 참고). */
export const defaultColumns = [
  columnHelper.accessor('status', { header: '상태', cell: StatusCell, size: 70 }),
  columnHelper.accessor('measureDate', { header: '측정일', cell: TextCell, size: 70 }),
  columnHelper.accessor('referenceNumber', { header: '관리번호', cell: TextCell }),
  columnHelper.accessor('clientName', { header: '의뢰기관', cell: TextCell }),
  columnHelper.accessor('workplaceName', { header: '사업장', cell: TextCell }),
  columnHelper.accessor('stackName', { header: '배출구', cell: TextCell }),
  columnHelper.accessor('teamName', { header: '팀', cell: TextCell }),
  columnHelper.accessor('deletedAt', { header: '삭제일', cell: TextCell, size: 70 }),
  columnHelper.display({ id: 'actions', header: '', cell: RestoreCell, size: 80 }),
];
