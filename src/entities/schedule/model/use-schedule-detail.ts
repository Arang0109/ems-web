import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useEntityQuery } from "@shared/model";

import { scheduleDetailQuery } from "./queries";
import type { ScheduleDetail } from "./types";

/** 측정계획 상세. `id` 가 null 이면 조회하지 않는다. */
export const useScheduleDetail = (id: number | null) =>
  useEntityQuery<ScheduleDetail | null>({
    ...scheduleDetailQuery(id as number),
    initialData: null,
    enabled: id != null,
  });

/**
 * 측정계획 상세를 **그 자리에서** 받아오는 명령형 조회.
 *
 * 저장이 409 로 거절됐을 때 서버 최신본을 곧바로 대조해야 하는 호출부가 있다 —
 * 다음 렌더의 `data` 를 기다리면 비동기 흐름이 꼬인다. `useScheduleDetail` 과 같은 캐시를 쓰므로
 * 화면을 소유한 위젯도 같은 값으로 수렴한다.
 *
 * **실패하면 `null` 이며 예외를 던지지 않는다** — 조회 실패는 화면이 안내하고 흐름은 이어져야 한다.
 */
export const useFetchScheduleDetail = () => {
  const queryClient = useQueryClient();

  return useCallback(
    async (id: number): Promise<ScheduleDetail | null> => {
      try {
        return await queryClient.fetchQuery(scheduleDetailQuery(id));
      } catch {
        return null;
      }
    },
    [queryClient],
  );
};
