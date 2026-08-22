import type { ScheduleItemsUpdate } from "@entities/schedule";

import type { ScheduleItemsForm } from "./types";

// 서버는 전달 목록으로 전체 교체하므로 순서·중복만 정리해 넘긴다.
export const toScheduleItemsUpdate = (form: ScheduleItemsForm): ScheduleItemsUpdate => ({
  pollutantIds: [...new Set(form.pollutantIds)],
});
