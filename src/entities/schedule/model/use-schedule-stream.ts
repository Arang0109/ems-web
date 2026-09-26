import { useEffect } from "react";

import { subscribeScheduleStream } from "../api/stream";
import type { SheetsSavedEvent } from "./types";

/**
 * 측정계획 편집 실시간 알림을 구독한다. `scheduleId` 가 `null` 이면 연결하지 않는다.
 *
 * `onSheetsSaved` 가 바뀌면 다시 구독하므로 호출부는 참조를 고정해 넘긴다(`useCallback`) —
 * 매 렌더 새 함수를 넘기면 글자를 칠 때마다 스트림이 끊겼다 다시 붙는다.
 */
export const useScheduleStream = (
  scheduleId: number | null,
  onSheetsSaved: (event: SheetsSavedEvent) => void,
) => {
  useEffect(() => {
    if (scheduleId == null) return;
    return subscribeScheduleStream(scheduleId, { onSheetsSaved });
  }, [scheduleId, onSheetsSaved]);
};
