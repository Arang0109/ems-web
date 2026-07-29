import { useState } from "react";

import type { ScheduleDetail, ClientSnapshotUpdate } from "./types";
import { scheduleApi } from "../api/api";
import { toChangeClientRequest, toScheduleDetail } from "../api/mapper";

export const useChangeClientAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 의뢰기관→사업장→측정시설 트리를 부분 수정한다.
  // 굴뚝 제원이 바뀌면 서버가 시트를 재계산하며, 최신 상세(도메인)를 반환한다.
  const changeClient = async (id: number, client: ClientSnapshotUpdate): Promise<ScheduleDetail> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await scheduleApi.changeClient(id, toChangeClientRequest(client));
      if (!result.status) {
        throw new Error(result.message ?? "서버 연결에 실패했습니다.");
      }
      return toScheduleDetail(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "서버 연결에 실패했습니다.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { changeClient, isLoading, error };
};
