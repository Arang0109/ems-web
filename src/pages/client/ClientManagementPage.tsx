import { PageTitle } from "@shared/ui/semantics";

import { CompanyTable } from "@widgets/company-table";
import { WorkplaceTable } from "@widgets/workplace-table";
import { StackTable } from "@widgets/stack-table";

import { useSelectCompany } from "@features/select-company";
import { useSelectWorkplace } from "@features/select-workplace";

export const ClientManagementPage = () => {
  const {
    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    selectedWorkplace,
    stackData,
    isLoading: isWorkplaceLoading,
    error: workplaceError
  } = useSelectWorkplace();

  const {
    handleSelectCompanyRow,
    selectedCompany,
    workplaceData,
    isLoading: isCompanyLoading,
    error: companyError
  } = useSelectCompany(clearWorkplaceSelection);

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="거래처 관리" description="측정 현황 및 통계 요약"/>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanyTable onRowClick={handleSelectCompanyRow} />
        <WorkplaceTable
          onRowClick={handleSelectWorkplaceRow}
          data={workplaceData} loading={isCompanyLoading} error={companyError} selectedCompany={selectedCompany} />
      </div>
      <div className="grid grid-cols-1">
        <StackTable data={stackData} loading={isWorkplaceLoading} error={workplaceError} selectedWorkplace={selectedWorkplace} />
      </div>
    </div>
  );
}
