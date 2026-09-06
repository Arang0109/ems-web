import { unwrapMessage } from "@shared/api";
import { useFetch } from "@shared/model";

import { documentApi } from "../api/api";
import type { DocumentVersion } from "./types";

interface Props {
  /** null이면 조회하지 않는다. 상세 모달이 닫혀 있을 때 null을 넘겨 조회를 막는다. */
  documentId: number | null;
}

/**
 * 타입 A(자동 로드): 문서의 버전 목록.
 *
 * 대상 문서가 바뀌면 이전 문서의 버전 목록을 즉시 비운다(`resetOnChange`) — 남겨두면
 * 새 목록이 도착하기 전까지 다른 문서의 버전이 선택 가능한 상태로 노출된다.
 */
export const useDocumentVersions = ({ documentId }: Props) =>
  useFetch<DocumentVersion[]>(
    async () => unwrapMessage(await documentApi.getDocumentVersions(documentId as number)),
    [],
    { deps: [documentId], enabled: documentId != null, resetOnChange: true },
  );
