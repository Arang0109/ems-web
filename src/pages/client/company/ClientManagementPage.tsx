import { PageTitle } from "@shared/ui/semantics";

import { CompanyTable } from "@widgets/company-table";
import { WorkplaceTable } from "@widgets/workplace-table";
import { StackTable } from "@widgets/stack-table";

import { useClientManagement } from "./model/use-client-management";

export const ClientManagementPage = () => {
  const {
    // CompanyTable
    selectedCompany,
    onSelectCompany,

    // WorkplaceTable
    workplaces,
    workplacesLoading,
    workplacesError,
    selectedWorkplace,
    onSelectWorkplace,
    refetchWorkplaces,

    // StackTable
    stacks, stacksLoading, stacksError, refetchStacks,
  } = useClientManagement();

  return (
    <div className="p-6 space-y-5 min-h-full">
      <PageTitle title="거래처 관리" description="측정대행 의뢰기관, 측정대상 사업장, 측정시설 목록이 표시됩니다."/>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanyTable
          selectedCompany={selectedCompany}
          onRowClick={onSelectCompany}
          onSuccess={refetchWorkplaces}
        />
        <WorkplaceTable
          workplaces={workplaces}
          loading={workplacesLoading}
          error={workplacesError}
          selectedCompany={selectedCompany}
          selectedWorkplace={selectedWorkplace}
          onRowClick={onSelectWorkplace}
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
