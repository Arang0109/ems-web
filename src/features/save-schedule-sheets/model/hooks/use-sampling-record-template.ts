import { useRef, useState } from "react";

import {
  MAX_DOCUMENT_FILE_SIZE,
  useDocuments,
  useDocumentVersions,
  useDownloadDocumentAction,
} from "@entities/document";
import type { SelectOption } from "@shared/ui/form";

const TEMPLATE_EXTENSION = ".xlsx";

interface Params {
  /** 모달 열림 여부. 닫혀 있는 동안에는 양식·버전을 조회하지 않는다. */
  enabled: boolean;
}

// 관리자가 등록해 둔 채취기록부 양식(문서 + 버전)을 고르고, 고른 버전의 파일을
// export API에 실을 File로 바꿔주는 훅. 서버는 저장된 양식을 자동으로 쓰지 않고
// 매번 템플릿 바이트를 multipart로 받으므로 프론트가 받아서 다시 올려야 한다.
export const useSamplingRecordTemplate = ({ enabled }: Params) => {
  const {
    data: documents,
    loading: documentsLoading,
    error: documentsError,
  } = useDocuments("SAMPLING_RECORD_TEMPLATE", { enabled });

  const [documentId, setDocumentId] = useState<number | null>(null);
  // null = "최신본". 버전 목록이 도착한 뒤 파생으로 확정하므로 effect 동기화가 필요 없다.
  const [versionNo, setVersionNo] = useState<number | null>(null);

  const {
    data: versions,
    loading: versionsLoading,
    error: versionsError,
  } = useDocumentVersions({ documentId: enabled ? documentId : null });

  const { downloadDocument } = useDownloadDocumentAction();

  // 서버가 versionNo 내림차순으로 주므로 versions[0]이 최신본이다.
  const selectedVersion = versions.find((v) => v.versionNo === versionNo) ?? versions[0] ?? null;

  const documentOptions: SelectOption[] = documents.map((doc) => ({
    value: String(doc.id),
    // 버전이 하나도 없는 문서는 템플릿으로 쓸 수 없으므로 고르지 못하게 막는다.
    label: doc.latestVersionNo === 0 ? `${doc.name} (파일 없음)` : doc.name,
    disabled: doc.latestVersionNo === 0,
  }));

  const versionOptions: SelectOption[] = versions.map((version, index) => ({
    value: String(version.versionNo),
    label: `v${version.versionNo}${index === 0 ? " (최신)" : ""} · ${version.originalFilename}`,
  }));

  // 파일 업로드 방식에서 하던 확장자·용량 검증을 버전 메타데이터 검증으로 옮긴 것.
  // 관리자가 분류만 채취기록부로 두고 pdf 등을 올려둘 수 있어 제출 전에 막는다.
  const templateError = (() => {
    if (!selectedVersion) return null;
    if (!selectedVersion.originalFilename.toLowerCase().endsWith(TEMPLATE_EXTENSION)) {
      return "선택한 버전이 엑셀(.xlsx) 파일이 아닙니다. 다른 양식을 선택해 주세요.";
    }
    if (selectedVersion.size > MAX_DOCUMENT_FILE_SIZE) {
      return "템플릿 파일 크기는 20MB 이하만 가능합니다.";
    }
    return null;
  })();

  const canSubmit =
    documentId != null && selectedVersion != null && !templateError && !versionsLoading;

  const handleSelectDocument = (id: number | null) => {
    setDocumentId(id);
    // 문서가 바뀌면 이전 문서의 버전 번호가 남지 않도록 최신본 기준으로 되돌린다.
    setVersionNo(null);
  };

  const handleSelectVersion = (no: number | null) => setVersionNo(no);

  // 같은 문서·버전을 반복해서 내려받지 않도록 마지막 것만 캐싱한다.
  // (기존 "한 번 고른 템플릿은 페이지에 머무는 동안 유지" 성질을 그대로 살린다.)
  const cacheRef = useRef<{ key: string; file: File } | null>(null);

  const resolveTemplateFile = async (): Promise<File> => {
    if (documentId == null || !selectedVersion) {
      throw new Error("채취기록부 양식을 선택해 주세요.");
    }

    const key = `${documentId}:${selectedVersion.versionNo}`;
    if (cacheRef.current?.key === key) return cacheRef.current.file;

    const { blob, filename } = await downloadDocument({
      documentId,
      versionNo: selectedVersion.versionNo,
      fallbackFilename: selectedVersion.originalFilename,
    });

    const file = new File([blob], filename, {
      // contentType은 업로드 시점 값이라 비어 있을 수 있어 blob 쪽으로 폴백한다.
      type: selectedVersion.contentType || blob.type,
    });
    cacheRef.current = { key, file };

    return file;
  };

  return {
    documentOptions,
    versionOptions,
    documentId,
    selectedVersion,

    isDocumentsLoading: documentsLoading,
    isVersionsLoading: versionsLoading,
    // 양식 목록·버전 목록 조회 실패는 화면에서 구분할 이유가 없어 한 줄로 합쳐 노출한다.
    loadError: documentsError ?? versionsError,
    templateError,
    canSubmit,

    handleSelectDocument,
    handleSelectVersion,
    resolveTemplateFile,
  };
};

export type SamplingRecordTemplate = ReturnType<typeof useSamplingRecordTemplate>;
