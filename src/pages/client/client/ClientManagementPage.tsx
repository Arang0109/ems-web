import { PageLayout } from "@shared/ui/layout";

import { ClientTable } from "@widgets/client-table";
import { WorkplaceTable } from "@widgets/workplace-table";
import { StackTable } from "@widgets/stack-table";

import { useClientManagement } from "./model/use-client-management";

export const ClientManagementPage = () => {
  const {
    // ClientTable
    selectedClient,
    onSelectClient,

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
    <PageLayout
      title="거래처 관리"
      description="측정대행 의뢰기관, 측정대상 사업장, 측정시설 목록이 표시됩니다."
    >
      <ClientTable
        selectedClient={selectedClient}
        onRowClick={onSelectClient}
        onSuccess={refetchWorkplaces}
      />
      <WorkplaceTable
        workplaces={workplaces}
        loading={workplacesLoading}
        error={workplacesError}
        selectedClient={selectedClient}
        selectedWorkplace={selectedWorkplace}
        onRowClick={onSelectWorkplace}
        onSuccess={refetchWorkplaces}
      />
      <StackTable
        stacks={stacks}
        loading={stacksLoading}
        error={stacksError}
        selectedWorkplace={selectedWorkplace}
        onSuccess={refetchStacks} />
    </PageLayout>
  );
}
