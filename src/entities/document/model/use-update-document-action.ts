import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import type { DocumentUpdate } from "./types";

export const useUpdateDocumentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, data: DocumentUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await documentApi.updateDocument(id, payload));
  });

  return { updateDocument: run, isLoading, error };
};
