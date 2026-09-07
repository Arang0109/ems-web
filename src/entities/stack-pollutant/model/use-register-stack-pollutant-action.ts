import { unwrapMessage } from "@shared/api";
import { useEntityMutation } from "@shared/model";

import type { StackPollutantCreate } from "./types";
import { stackPollutantApi } from "../api/api";
import { toRegisterStackPollutantRequest, toRegisterStackPollutantRequests } from "../api/mapper";
import { stackPollutantKeys } from "./query-keys";

/**
 * 측정시설 측정항목 등록. 한 건과 여러 건의 경로가 서버에서 갈려 있어 트리거도 둘이다.
 * 상태는 하나로 합쳐 내보낸다 — 화면에는 등록 버튼이 하나뿐이라 둘 중 무엇이 돌았는지 구분하지 않는다.
 */
export const useRegisterStackPollutantAction = () => {
  const single = useEntityMutation(async (data: StackPollutantCreate) => {
    unwrapMessage(await stackPollutantApi.registerStackPollutant(toRegisterStackPollutantRequest(data)));
  }, { invalidateKeys: [stackPollutantKeys.all] });

  const bulk = useEntityMutation(async (items: StackPollutantCreate[]) => {
    unwrapMessage(await stackPollutantApi.registerStackPollutants(toRegisterStackPollutantRequests(items)));
  }, { invalidateKeys: [stackPollutantKeys.all] });

  return {
    registerStackPollutant: single.run,
    registerStackPollutants: bulk.run,
    isLoading: single.isLoading || bulk.isLoading,
    error: single.error ?? bulk.error,
  };
};
