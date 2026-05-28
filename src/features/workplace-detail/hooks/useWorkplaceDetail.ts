import { useState, useCallback } from "react";

import { workplaceApi } from "@entities/workplace";
import type { WorkplaceDetail } from "@entities/workplace";

export const useWorkplaceDetail = () => {
  const [workplace, setWorkplace] = useState<WorkplaceDetail | null>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkplace = useCallback(async (workplaceId: number) => {
    setIsLoading(true);

    try {
      const { status, data } = await workplaceApi.getWorkplaceDetail(workplaceId);
      setWorkplace(status ? data : null);
    } catch (error) {
      console.error(error);
      setWorkplace(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { workplace, fetchWorkplace, isLoading };
}