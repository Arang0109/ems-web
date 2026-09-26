import type { Table } from "@tanstack/react-table";
import { CalendarDays, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { SCHEDULE_STATUS_TONE, canDeleteSchedule } from "@entities/schedule";
import { TONE_DOT } from "@shared/ui/badges";
import { IconButton } from "@shared/ui/buttons";

import type { ScheduleTableRow } from "../model/types";

interface Props {
  row: ScheduleTableRow;
  table: Table<ScheduleTableRow>;
}

/**
 * 모바일 카드의 본문 — 좌측 상태색 바 + 관리번호(강조 값) + 측정일 한 줄 + 삭제.
 *
 * 라벨/값 격자가 아니라 관리번호 하나를 키로 세운 배치라 `fields` 로 선언하지 않고
 * `MobileCardConfig.body` 로 직접 그린다.
 * 삭제 콜백은 `useDataTable({ overrides: { meta } })` 이 주입한다.
 */
export const ScheduleCardBody = ({ row, table }: Props) => {
  const { onDelete, isRowActionPending } = table.options.meta ?? {};
  // 진행 중인 계획은 서버가 삭제를 거절한다 — 누를 수 없는 버튼을 보이지 않는다.
  const isDeletable = canDeleteSchedule(row.status);

  return (
    <div className="flex items-center gap-4">
      {/* 상태 칩과 같은 톤으로 카드 본문을 물들인다 */}
      <span
        aria-hidden="true"
        className={cn(
          "w-1 shrink-0 self-stretch rounded-full",
          TONE_DOT[SCHEDULE_STATUS_TONE[row.status]]
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-col gap-px">
          <p className="text-label text-muted-ink">관리번호</p>
          <p className="truncate text-h3 text-ink">{row.referenceNumber}</p>
        </div>
        <p className="flex items-center gap-2 pb-1">
          <span className="flex shrink-0 items-center gap-1 text-label text-muted-ink">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
            측정일
          </span>
          <span className="truncate text-body-4 text-ink-soft">{row.measureDate}</span>
        </p>
      </div>

      {isDeletable && onDelete && (
        // 삭제 탭이 카드 전체 탭(상세 이동)으로 번지지 않게 차단한다
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={<Trash2 className="size-5" />}
            label="측정계획 삭제"
            disabled={isRowActionPending}
            onClick={() => onDelete(row)}
          />
        </div>
      )}
    </div>
  );
};
