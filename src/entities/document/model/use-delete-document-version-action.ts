import { useEntityMutation } from "@shared/model";
import { unwrapMessage } from "@shared/api";
import { documentApi } from "../api/api";
import { documentKeys } from "./query-keys";

export const useDeleteDocumentVersionAction = () => {
  const { run, isLoading, error } = useEntityMutation(async (id: number, versionNo: number) => {
    unwrapMessage(await documentApi.deleteDocumentVersion(id, versionNo));
  }, { invalidateKeys: [documentKeys.all] });

  return { deleteDocumentVersion: run, isLoading, error };
};
