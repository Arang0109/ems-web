import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";
import type { DocumentCategory } from "@shared/model";

import { documentApi } from "../api/api";
import type { Document } from "./types";

interface Options {
  /** false면 조회하지 않는다. 모달이 닫혀 있는 동안 불필요한 요청을 막는 용도. 기본 true. */
  enabled?: boolean;
}

/** 타입 A(자동 로드): 문서 목록. `category` 로 분류를 좁힌다. */
export const useDocuments = (category?: DocumentCategory, options?: Options) =>
  useFetch<Document[]>(
    async () => unwrapMessage(await documentApi.getDocuments(category)),
    [],
    { deps: [category], enabled: options?.enabled ?? true },
  );
