import { DOCUMENT_CATEGORY } from "@shared/model";
import { DOCUMENT_CATEGORY_LABEL } from "@shared/config";

import { PageLayout } from "@shared/ui/layout";
import { Tabs } from "@shared/ui/tabs";

import { DocumentTable } from "@widgets/document-table";

export const AdminDocumentPage = () => {
  const tabOptions = DOCUMENT_CATEGORY.map((category) => ({
    value: category,
    label: DOCUMENT_CATEGORY_LABEL[category],
    content: <DocumentTable category={category} />,
  }));

  return (
    <PageLayout
      title="문서 관리"
      description="채취기록부 양식, 계약서, 인증서 등 문서를 분류별로 등록하고 버전을 관리할 수 있습니다."
    >
      <Tabs options={tabOptions} />
    </PageLayout>
  );
};
