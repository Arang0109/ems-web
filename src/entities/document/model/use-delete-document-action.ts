import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";

export const useDeleteDocumentAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number) => {
    unwrapMessage(await documentApi.deleteDocument(id));
  });

  return { deleteDocument: run, isLoading, error };
};
