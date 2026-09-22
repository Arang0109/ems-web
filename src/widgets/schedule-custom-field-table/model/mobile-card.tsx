import type { MobileCardConfig } from "@shared/model";

import type { ScheduleCustomFieldTableRow } from "./types";

/** 모바일 카드 배치. 데스크탑 컬럼 정의(`columns.ts`)와 독립적이다. */
export const scheduleCustomFieldCardConfig: MobileCardConfig<ScheduleCustomFieldTableRow> = {
  title: (row) => row.label,
  subtitle: (row) => row.key,
  columns: 1,
  fields: [
    { label: "표시 순서", content: (row) => row.sortOrder },
  ],
};
