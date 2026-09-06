import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { documentApi } from "../api/api";
import type { Document } from "./types";

interface Props {
  /** null 이면 조회하지 않는다. */
  id: number | null;
}

/** 타입 A(자동 로드): 문서 상세. 대상이 바뀌면 이전 값을 즉시 버린다. */
export const useDocumentDetail = ({ id }: Props) =>
  useFetch<Document | null>(
    async () => unwrapMessage(await documentApi.getDocument(id as number)),
    null,
    { deps: [id], enabled: id != null, resetOnChange: true },
  );
