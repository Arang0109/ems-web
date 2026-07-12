import { useClientSelection } from "./use-client-selection";
import { useWorkplaceSelection } from "./use-workplace-selection";

export const useClientManagement = () => {
    const workplace = useWorkplaceSelection();
    const client = useClientSelection({ onChange: workplace.clearWorkplaceSelection });

    return {
      // ClientTable
      selectedClient: client.selectedClient,
      onSelectClient: client.handleSelectClientRow,

      // WorkplaceTable
      workplaces: client.workplaces,
      workplacesLoading: client.loading,
      workplacesError: client.error,
      selectedWorkplace: workplace.selectedWorkplace,
      onSelectWorkplace: workplace.handleSelectWorkplaceRow,
      refetchWorkplaces: client.refetchWorkplaces,

      // StackTable
      stacks: workplace.stacks,
      stacksLoading: workplace.loading,
      stacksError: workplace.error,
      refetchStacks: workplace.refetchStacks,
    };
  };