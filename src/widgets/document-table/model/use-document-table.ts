import { useState, useMemo } from 'react';

import { useDocuments } from '@entities/document';
import type { DocumentCategory } from '@entities/document';
import { useDownloadDocument } from '@features/download-document';

import { useDataTable } from '@shared/model';

import { defaultColumns } from './columns';
import { toDocumentRows } from './mapper';
import type { DocumentTableRow } from './types';

interface Props {
  category: DocumentCategory;
  onRowClick: (documentId: number) => void;
  onSuccess?: () => void;
}

export const useDocumentTable = ({ category, onRowClick, onSuccess }: Props) => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { data, loading, error, refetch: documentRefetch } = useDocuments(category);
  const { handleDownload } = useDownloadDocument();

  const tableData = useMemo(() => data.map(toDocumentRows), [data]);

  const refetch = () => {
    documentRefetch();
    onSuccess?.();
  };

  // useDataTable 은 `meta: { onViewDetail }, ...overrides` 순서라 overrides.meta 가 통째로 덮어쓴다.
  // 두 콜백을 함께 넣어야 상세보기가 죽지 않는다.
  const { table, globalFilter, setGlobalFilter } = useDataTable<DocumentTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: 5,
    overrides: {
      meta: {
        onViewDetail: () => setDetailModalOpen(true),
        onDownloadDocument: (row: DocumentTableRow) =>
          handleDownload({ documentId: row.id, fallbackFilename: row.name }),
      },
    },
  });

  const handleRowClick = (row: DocumentTableRow) => {
    onRowClick(row.id);
  };

  return {
    table,

    handleRowClick,

    registerModalOpen, setRegisterModalOpen,
    detailModalOpen, setDetailModalOpen,

    globalFilter, setGlobalFilter,

    loading, error, refetch,
  };
};
