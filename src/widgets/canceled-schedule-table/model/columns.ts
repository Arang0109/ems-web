import { createColumnHelper } from "@tanstack/react-table";

import { DeleteCell, TextCell } from "../ui/Cells";
import type { CanceledScheduleTableRow } from "./types";

const columnHelper = createColumnHelper<CanceledScheduleTableRow>();

/**
 * 상태 컬럼은 두지 않는다 — 이 표의 모든 행이 '취소'라 배지가 정보를 더하지 않는다.
 * 삭제 콜백은 컬럼이 아니라 `table.options.meta` 로 주입된다(`DeleteCell` 참고).
 */
export const defaultColumns = [
  columnHelper.accessor('measureDate', { header: '측정일', cell: TextCell, size: 70 }),
  columnHelper.accessor('referenceNumber', { header: '관리번호', cell: TextCell }),
  columnHelper.accessor('clientName', { header: '의뢰기관', cell: TextCell }),
  columnHelper.accessor('stackName', { header: '배출구', cell: TextCell }),
  columnHelper.accessor('teamName', { header: '팀', cell: TextCell }),
  columnHelper.display({ id: 'actions', header: '', cell: DeleteCell, size: 80 }),
];
