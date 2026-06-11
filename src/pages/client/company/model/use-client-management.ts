import { useCompanySelection } from "@features/select-company";
import { useWorkplaceSelection } from "@features/select-workplace";

export const useClientManagement = () => {
    const workplace = useWorkplaceSelection();
    const company = useCompanySelection({ onChange: workplace.clearWorkplaceSelection });

    return {
      // CompanyTable
      selectedCompany: company.selectedCompany,
      onSelectCompany: company.handleSelectCompanyRow,

      // WorkplaceTable
      workplaces: company.workplaces,
      workplacesLoading: company.loading,
      workplacesError: company.error,
      selectedWorkplace: workplace.selectedWorkplace,
      onSelectWorkplace: workplace.handleSelectWorkplaceRow,
      refetchWorkplaces: company.refetchWorkplaces,

      // StackTable
      stacks: workplace.stacks,
      stacksLoading: workplace.loading,
      stacksError: workplace.error,
      refetchStacks: workplace.refetchStacks,
    };
  };