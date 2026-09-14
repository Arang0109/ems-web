import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { measurementMethodApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import type { MeasurementMethodUpdate } from "./types";
import { measurementMethodKeys } from "./query-keys";

/**
 * 측정물질 목록은 측정방법 이름·채취시간을 조인해 보여주므로 그쪽도 갱신돼야 한다.
 * 같은 레이어를 import 할 수 없어 여기서는 자기 키만 무효화하고, 측정물질 키는 feature 훅이 맡는다.
 */
export const useUpdateMeasurementMethodAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: MeasurementMethodUpdate) => {
    unwrapMessage(await measurementMethodApi.updateMeasurementMethod(id, toUpdateRequest(data)));
  }, { invalidateKeys: [measurementMethodKeys.all] });

  return { updateMeasurementMethod: run, isLoading, error };
};
