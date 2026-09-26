import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { measurementMethodApi } from "../api/api";
import { measurementMethodKeys } from "./query-keys";

export const useDeleteMeasurementMethodAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await measurementMethodApi.deleteMeasurementMethod(id));
  }, { invalidateKeys: [measurementMethodKeys.all] });

  return { deleteMeasurementMethod: run, isLoading, error };
};
