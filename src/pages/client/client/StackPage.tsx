
import { StackListTable } from "@widgets/stack-list-table";

import { PageLayout } from "@shared/ui/layout";

export const StackPage = () => {
  return(
    <PageLayout title="측정시설 조회/관리" description="측정시설 조회 및 관리 페이지입니다.">
      <StackListTable />
    </PageLayout>
  );
}
