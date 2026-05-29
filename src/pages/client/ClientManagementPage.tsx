import { PageTitle } from "@shared/ui/semantics";

import { CompanyTable } from "@widgets/company-table";
import { WorkplaceTable } from "@widgets/workplace-table";

import { useSelectCompany } from "@features/select-company";

export const ClientManagementPage = () => {
  const { handleSelectCompanyRow, selectedCompany, workplaceTableData, isLoading, error } = useSelectCompany();

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="거래처 관리" description="측정 현황 및 통계 요약"/>
    
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanyTable onRowClick={handleSelectCompanyRow} />
        <WorkplaceTable data={workplaceTableData} loading={isLoading} error={error} selectedCompany={selectedCompany} />
      </div>
    </div>
  );
}