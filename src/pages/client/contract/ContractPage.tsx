
import { ContractTable } from "@widgets/contract-table";

import { PageLayout } from "@shared/ui/layout";

export const ContractPage = () => {
  return (
    <PageLayout title="계약 조회/관리" description="계약서 조회 및 관리 페이지입니다.">
      <ContractTable />
    </PageLayout>
  );
}
