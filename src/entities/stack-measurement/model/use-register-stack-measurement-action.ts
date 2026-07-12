import { useState } from "react";

import type { StackMeasurementCreate } from "./types";
import { stackMeasurementApi } from "../api/api";
import { toRegisterStackMeasurementRequest, toRegisterStackMeasurementRequests } from "../api/mapper";

export const useRegisterStackMeasurementAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerStackMeasurement = async (data: StackMeasurementCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterStackMeasurementRequest(data);

    try {
      const result = await stackMeasurementApi.registerStackMeasurement(payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerStackMeasurements = async (items: StackMeasurementCreate[]) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterStackMeasurementRequests(items);

    try {
      const result = await stackMeasurementApi.registerStackMeasurements(payload);
      if (!result.status) {
        throw new Error(result.message ?? '서버 연결에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '서버 연결에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { registerStackMeasurement, registerStackMeasurements, isLoading, error };
};