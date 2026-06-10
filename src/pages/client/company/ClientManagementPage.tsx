import { PageTitle } from "@shared/ui/semantics";

import { CompanyTable } from "@widgets/company-table";
import { WorkplaceTable } from "@widgets/workplace-table";
import { StackTable } from "@widgets/stack-table";

import { useCompanySelection } from "@features/select-company";
import { useWorkplaceSelection } from "@features/select-workplace";

export const ClientManagementPage = () => {
  const {
    stacks, selectedWorkplace,

    handleSelectWorkplaceRow,
    clearWorkplaceSelection,
    refetchStacks,
    
    loading: stacksLoading,
    error: stacksError,
  } = useWorkplaceSelection();

  const {
    workplaces, selectedCompany,

    handleSelectCompanyRow,
    refetchWorkplaces,
    
    loading: workplacesLoading,
    error: workplacesError,
  } = useCompanySelection({ onChange: clearWorkplaceSelection });

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="거래처 관리" description="측정대행 의뢰기관, 측정대상 사업장, 측정시설 목록이 표시됩니다."/>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanyTable
          selectedCompany={selectedCompany}
          onRowClick={handleSelectCompanyRow}
        />
        <WorkplaceTable
          workplaces={workplaces}
          loading={workplacesLoading}
          error={workplacesError}
          selectedCompany={selectedCompany}
          onRowClick={handleSelectWorkplaceRow}
          onSuccess={refetchWorkplaces}
        />
      </div>
      <div className="grid grid-cols-1">
        <StackTable
          stacks={stacks}
          loading={stacksLoading}
          error={stacksError}
          selectedWorkplace={selectedWorkplace}
          onSuccess={refetchStacks} />
      </div>
    </div>
  );
}
