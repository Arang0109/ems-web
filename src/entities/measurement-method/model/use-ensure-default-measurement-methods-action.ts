import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { measurementMethodApi } from "../api/api";
import { toMeasurementMethods } from "../api/mapper";
import { measurementMethodKeys } from "./query-keys";

/** 기본 8종 채우기. 이름 기준 멱등이라 몇 번을 불러도 늘어나지 않는다. 채운 뒤 전체 목록을 돌려준다. */
export const useEnsureDefaultMeasurementMethodsAction = () => {
  const { run, isLoading, error } = useEntityMutation(async () =>
    toMeasurementMethods(unwrapMessage(await measurementMethodApi.ensureDefaultMeasurementMethods())),
  { invalidateKeys: [measurementMethodKeys.all] });

  return { ensureDefaultMeasurementMethods: run, isLoading, error };
};
