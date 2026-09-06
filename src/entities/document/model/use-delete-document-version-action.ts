import { useAsyncAction } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";

export const useDeleteDocumentVersionAction = () => {
  const { run, isLoading, error } = useAsyncAction(async (id: number, versionNo: number) => {
    unwrapMessage(await documentApi.deleteDocumentVersion(id, versionNo));
  });

  return { deleteDocumentVersion: run, isLoading, error };
};
