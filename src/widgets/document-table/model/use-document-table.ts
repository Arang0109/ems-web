import { useState, useMemo } from 'react';

import { useDocuments } from '@entities/document';
import type { DocumentCategory } from '@shared/model';
import { useDownloadDocument } from '@features/download-document';

import { useDataTable } from '@shared/model';

import { defaultColumns } from './columns';
import { toDocumentRows } from './mapper';
import type { DocumentTableRow } from './types';

import { TABLE_PAGE_SIZE } from "@shared/config";

interface Props {
  category: DocumentCategory;
}

export const useDocumentTable = ({ category }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  /** 상세 모달 대상 겸 행 선택 강조 대상 — 상세보기를 누른(또는 클릭한) 행이다. */
  const [detailDocumentId, setDetailDocumentId] = useState<number | null>(null);

  const { data, isLoading: loading, error } = useDocuments(category);
  const { handleDownload } = useDownloadDocument();

  const tableData = useMemo(() => data.map(toDocumentRows), [data]);

  // Row 는 표시용 포맷 값이라 상세 모달에 쓸 수 없다. 목록 원본에서 같은 id 를 찾는다.
  // id 만 보관하고 파생시켜야 목록 캐시가 갱신된 뒤에도 모달이 최신 값을 따른다.
  const detailDocument = useMemo(
    () => data.find((document) => document.id === detailDocumentId) ?? null,
    [data, detailDocumentId],
  );

;

  const handleViewDetail = (row: DocumentTableRow) => {
    setDetailDocumentId(row.id);
    setDetailModalOpen(true);
  };

  const { table, globalFilter, setGlobalFilter } = useDataTable<DocumentTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: TABLE_PAGE_SIZE.COMPACT,
    onViewDetail: handleViewDetail,
    overrides: {
      meta: {
        onDownload: (row: DocumentTableRow) =>
          handleDownload({ documentId: row.id, fallbackFilename: row.name }),
      },
    },
  });

  return {
    table,

    handleRowClick: handleViewDetail,

    registerModalOpen, setRegisterModalOpen,
    detailModalOpen, setDetailModalOpen,
    detailDocument, detailDocumentId,

    globalFilter, setGlobalFilter,

    isLoading: loading, error,
  };
};
