
import { ContractTable } from "@widgets/contract-table";

import { PageTitle } from "@shared/ui/semantics";

export const ContractPage = () => {
  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="계약 조회/관리" description="계약서 조회 및 관리 페이지입니다."/>

      <ContractTable />
    </div>
  );
}