import { DOCUMENT_CATEGORY, DOCUMENT_CATEGORY_LABEL } from "@entities/document";

import { PageLayout } from "@shared/ui/layout";
import { Tabs } from "@shared/ui/tabs";

import { DocumentTable } from "@widgets/document-table";

import { useDocumentSelection } from "./model/use-document-selection";

export const AdminDocumentPage = () => {
  const { selectedDocument, handleSelectDocumentRow, refetchSelectedDocument } = useDocumentSelection();

  const tabOptions = DOCUMENT_CATEGORY.map((category) => ({
    value: category,
    label: DOCUMENT_CATEGORY_LABEL[category],
    content: (
      <DocumentTable
        category={category}
        selectedDocument={selectedDocument}
        onRowClick={handleSelectDocumentRow}
        onSuccess={refetchSelectedDocument}
      />
    ),
  }));

  return (
    <PageLayout
      title="문서 관리"
      description="성적서·채취기록부 양식, 계약서, 인증서 등 문서를 분류별로 등록하고 버전을 관리할 수 있습니다."
    >
      <Tabs options={tabOptions} />
    </PageLayout>
  );
};
