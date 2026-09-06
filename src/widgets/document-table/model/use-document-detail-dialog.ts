import { useState, useMemo } from 'react';

import { useDocumentVersions } from '@entities/document';
import type { Document } from '@entities/document';
import { useDeleteDocumentVersion } from '@features/delete-document-version';
import { useDownloadDocument } from '@features/download-document';

import { useDataTable } from '@shared/model';

import { versionColumns } from './version-columns';
import { toDocumentVersionRows } from './mapper';
import type { DocumentVersionTableRow } from './types';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  document: Document | null;
  /** 상세 모달 열림 여부. 닫혀 있으면 버전 목록을 조회하지 않는다. */
  open: boolean;
  onSuccess?: () => void;
}

export const useDocumentDetailDialog = ({ document, open, onSuccess }: Props) => {
  const [uploadOpen, setUploadOpen] = useState(false);

  const documentId = open && document ? document.id : null;

  const { data, isLoading: loading, error, refetch } = useDocumentVersions({ documentId });
  const { handleDownload } = useDownloadDocument();

  // 버전 목록과 함께 문서 목록·상세(최신 버전 번호, 수정일)도 갱신한다.
  const handleVersionChanged = () => {
    refetch();
    onSuccess?.();
  };

  const { handleDelete, isLoading: isDeleting } = useDeleteDocumentVersion({
    documentId,
    onSuccess: handleVersionChanged,
  });

  const versionData = useMemo(
    // 마지막 남은 한 개는 서버가 삭제를 막으므로 목록이 둘 이상일 때만 삭제 가능하다.
    () => (document ? data.map((version) => toDocumentVersionRows(version, document.id, data.length > 1)) : []),
    [data, document],
  );

  const { table } = useDataTable<DocumentVersionTableRow>({
    data: versionData,
    columns: versionColumns,
    pageSize: TABLE_PAGE_SIZE.COMPACT,
    overrides: {
      meta: {
        onDownload: (row: DocumentVersionTableRow) =>
          handleDownload({
            documentId: row.documentId,
            versionNo: row.versionNo,
            fallbackFilename: row.originalFilename,
          }),
        onDelete: (row: DocumentVersionTableRow) => handleDelete(row.versionNo),
        isRowActionPending: isDeleting,
      },
    },
  });

  return {
    table,

    versionsLoading: loading,
    versionsError: error,

    uploadOpen, setUploadOpen,
    handleVersionChanged,
  };
};
