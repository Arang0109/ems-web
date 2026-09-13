import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { toUpdateRequest } from "../api/mapper";
import type { DocumentUpdate } from "./types";
import { documentKeys } from "./query-keys";

export const useUpdateDocumentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, data: DocumentUpdate) => {
    const payload = toUpdateRequest(data);

    unwrapMessage(await documentApi.updateDocument(id, payload));
  }, { invalidateKeys: [documentKeys.all] });

  return { updateDocument: run, isLoading, error };
};
