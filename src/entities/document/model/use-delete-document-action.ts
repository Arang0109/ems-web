import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { documentKeys } from "./query-keys";

export const useDeleteDocumentAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number) => {
    unwrapMessage(await documentApi.deleteDocument(id));
  }, { invalidateKeys: [documentKeys.all] });

  return { deleteDocument: run, isLoading, error };
};
