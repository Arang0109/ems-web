import { useState, useMemo } from 'react';

import { useDocuments } from '@entities/document';
import type { DocumentCategory } from '@shared/model';
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

  const { table, globalFilter, setGlobalFilter } = useDataTable<DocumentTableRow>({
    data: tableData,
    columns: defaultColumns,
    pageSize: 5,
    onViewDetail: () => setDetailModalOpen(true),
    overrides: {
      meta: {
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
