
import { StackListTable } from "@widgets/stack-list-table";

import { PageTitle } from "@shared/ui/semantics";

export const StackPage = () => {
  return(
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="측정시설 조회/관리" description="측정시설 조회 및 관리 페이지입니다." />

      <StackListTable />
    </div>
  );
}