import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toRegisterRequest } from "../api/mapper";
import type { DocumentCreate } from "./types";

export const useRegisterDocumentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (data: DocumentCreate): Promise<number> => {
    const payload = toRegisterRequest(data);

    const result = unwrapMessage(await documentApi.registerDocument(payload));
    return result;
  });

  return { registerDocument: run, isLoading, error };
};
