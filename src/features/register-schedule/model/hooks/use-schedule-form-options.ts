import { useClients } from "@entities/client";
import { useWorkplaces } from "@entities/workplace";
import { useStacks } from "@entities/stack";
import { useTeams } from "@entities/team";
import { useStackPollutants } from "@entities/stack-pollutant";
import type { SelectOption } from "@shared/ui/form";

// 측정계획 등록 폼의 연쇄 select 옵션을 조립한다.
// 거래처(자동) → 사업장(거래처 선택 시 fetch) → 측정시설(사업장 선택 시 fetch), 팀(자동).
// 측정시설 선택 시 해당 시설의 측정항목(stack-pollutant) 목록을 fetch한다.
export const useScheduleFormOptions = () => {
  const { data: clients } = useClients();
  const { data: workplaces, fetchWorkplaces } = useWorkplaces();
  const { data: stacks, fetchStacks } = useStacks();
  const { data: teams } = useTeams();
  const {
    data: stackPollutants,
    loading: stackPollutantsLoading,
    fetchStackPollutants,
  } = useStackPollutants();

  const clientOptions: SelectOption[] = clients.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const workplaceOptions: SelectOption[] = workplaces.map((w) => ({
    value: String(w.id),
    label: w.workplaceName,
  }));

  const stackOptions: SelectOption[] = stacks.map((s) => ({
    value: String(s.id),
    label: s.stackName,
  }));

  const teamOptions: SelectOption[] = teams.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  return {
    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,

    stackPollutants,
    stackPollutantsLoading,

    fetchWorkplaces,
    fetchStacks,
    fetchStackPollutants,
  };
};
