import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toAddVersionRequest } from "../api/mapper";
import type { DocumentVersionCreate } from "./types";

export const useAddDocumentVersionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: DocumentVersionCreate): Promise<number> => {
    const payload = toAddVersionRequest(data);

    const result = unwrapMessage(await documentApi.addDocumentVersion(id, payload));
    return result;
  });

  return { addDocumentVersion: run, isLoading, error };
};
