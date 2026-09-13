import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import type { DocumentCreate } from "./types";
import { documentKeys } from "./query-keys";

export const useRegisterDocumentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (data: DocumentCreate): Promise<number> => {
    const payload = toRegisterRequest(data);

    const result = unwrapMessage(await documentApi.registerDocument(payload));
    return result;
  }, { invalidateKeys: [documentKeys.all] });

  return { registerDocument: run, isLoading, error };
};
