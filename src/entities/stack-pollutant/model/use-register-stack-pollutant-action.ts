import { useState } from "react";

import type { StackPollutantCreate } from "./types";
import { stackPollutantApi } from "../api/api";
import { toRegisterStackPollutantRequest, toRegisterStackPollutantRequests } from "../api/mapper";

export const useRegisterStackPollutantAction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerStackPollutant = async (data: StackPollutantCreate) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterStackPollutantRequest(data);

    try {
      const result = await stackPollutantApi.registerStackPollutant(payload);
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

  const registerStackPollutants = async (items: StackPollutantCreate[]) => {
    setIsLoading(true);
    setError(null);

    const payload = toRegisterStackPollutantRequests(items);

    try {
      const result = await stackPollutantApi.registerStackPollutants(payload);
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

  return { registerStackPollutant, registerStackPollutants, isLoading, error };
};