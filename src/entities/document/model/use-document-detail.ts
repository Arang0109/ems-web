import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";

import { documentApi } from "../api/api";
import { documentKeys } from "./query-keys";
import type { Document } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 문서 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useDocumentDetail = ({ id }: Props) =>
  useEntityQuery<Document | null>({
    queryKey: documentKeys.detail(id as number),
    queryFn: async () => unwrapMessage(await documentApi.getDocument(id as number)),
    initialData: null,
    enabled: id != null,
  });
