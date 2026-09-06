import { createColumnHelper } from "@tanstack/react-table";

import { CustomCell, StatusBadgeCell } from "../ui/Cells";
import type { ScheduleTableRow } from "./types";

const columnHelper = createColumnHelper<ScheduleTableRow>();

/** 데스크탑 표 전용 컬럼 정의. 모바일 카드 배치는 `mobile-card.tsx` 가 따로 선언한다. */
export const defaultColumns = [
  columnHelper.accessor('status', { header: '상태', cell: StatusBadgeCell, size: 70 }),
  columnHelper.accessor('measureDate', { header: '측정일', cell: CustomCell, size: 70 }),
  columnHelper.accessor('referenceNumber', { header: '관리번호', cell: CustomCell }),
  columnHelper.accessor('measurementField', { header: '측정분야', cell: CustomCell, size: 70 }),
  columnHelper.accessor('clientName', { header: '의뢰기관', cell: CustomCell }),
  columnHelper.accessor('stackName', { header: '배출구', cell: CustomCell }),
  columnHelper.accessor('teamName', { header: '팀', cell: CustomCell }),
];
