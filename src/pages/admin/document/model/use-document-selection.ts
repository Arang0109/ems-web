import { useState } from 'react';

import { useDocumentDetail } from '@entities/document';

export const useDocumentSelection = () => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  const { data: selectedDocument, refetch: refetchSelectedDocument } = useDocumentDetail({
    id: selectedDocumentId,
  });

  const handleSelectDocumentRow = (documentId: number) => setSelectedDocumentId(documentId);

  return { selectedDocument, handleSelectDocumentRow, refetchSelectedDocument };
};
