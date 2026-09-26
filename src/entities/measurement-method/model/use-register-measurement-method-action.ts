import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { measurementMethodApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import type { MeasurementMethodCreate } from "./types";
import { measurementMethodKeys } from "./query-keys";

export const useRegisterMeasurementMethodAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: MeasurementMethodCreate) => {
    unwrapMessage(await measurementMethodApi.registerMeasurementMethod(toRegisterRequest(data)));
  }, { invalidateKeys: [measurementMethodKeys.all] });

  return { registerMeasurementMethod: run, isLoading, error };
};
