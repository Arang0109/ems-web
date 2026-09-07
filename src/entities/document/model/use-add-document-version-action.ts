import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toAddVersionRequest } from "../api/mapper";
import type { DocumentVersionCreate } from "./types";
import { documentKeys } from "./query-keys";

export const useAddDocumentVersionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: DocumentVersionCreate): Promise<number> => {
    const payload = toAddVersionRequest(data);

    const result = unwrapMessage(await documentApi.addDocumentVersion(id, payload));
    return result;
  }, { invalidateKeys: [documentKeys.all] });

  return { addDocumentVersion: run, isLoading, error };
};
