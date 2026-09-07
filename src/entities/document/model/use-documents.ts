import { unwrapMessage } from "@shared/api";
import { useEntityQuery } from "@shared/model";
import type { DocumentCategory } from "@shared/model";

import { documentApi } from "../api/api";
import { documentKeys } from "./query-keys";
import type { Document } from "./types";

interface Options {
  /** false면 조회하지 않는다. 모달이 닫혀 있는 동안 불필요한 요청을 막는 용도. 기본 true. */
  enabled?: boolean;
}

/** 문서 목록. `category` 로 분류를 좁힌다. */
export const useDocuments = (category?: DocumentCategory, options?: Options) =>
  useEntityQuery<Document[]>({
    queryKey: documentKeys.list(category),
    queryFn: async () => unwrapMessage(await documentApi.getDocuments(category)),
    initialData: [],
    enabled: options?.enabled ?? true,
    // 분류가 다른 목록도 함께 갱신한다 — 등록·삭제는 어느 분류에서 일어나든 전체에 영향을 준다.
    invalidateKey: documentKeys.lists(),
  });
