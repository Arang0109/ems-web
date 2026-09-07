import { useClients } from "@entities/client";
import { useWorkplaces } from "@entities/workplace";
import { useStacks } from "@entities/stack";
import { useTeams, useTeamDetail } from "@entities/team";
import { useStackPollutants } from "@entities/stack-pollutant";
import type { SelectOption } from "@shared/ui/form";

interface Props {
  /** 폼에서 현재 고른 값. 빈 문자열이면 아직 고르지 않은 것이다. */
  clientId: string;
  workplaceId: string;
  stackId: string;
  teamId: string;
}

const toId = (value: string): number | null => (value ? Number(value) : null);

/**
 * 측정계획 등록 폼의 연쇄 select 옵션.
 *
 * 거래처(자동) → 사업장(거래처를 고르면) → 측정시설(사업장을 고르면) → 측정항목(측정시설을 고르면).
 * **선택값을 인자로 받아 하위 목록이 따라온다** — 폼이 명시적으로 조회를 트리거하지 않는다.
 * 상위를 고르지 않았으면 `enabled: false` 로 조회 자체를 막는다(전체 목록을 받아오면
 * 고르지도 않은 거래처의 사업장이 선택지에 뜬다).
 */
export const useScheduleFormOptions = ({ clientId, workplaceId, stackId, teamId }: Props) => {
  const selectedClientId = toId(clientId);
  const selectedWorkplaceId = toId(workplaceId);
  const selectedStackId = toId(stackId);
  const selectedTeamId = toId(teamId);

  const { data: clients } = useClients();
  const { data: teams } = useTeams();

  const { data: workplaces } = useWorkplaces(selectedClientId, {
    enabled: selectedClientId != null,
  });
  const { data: stacks } = useStacks(selectedWorkplaceId, {
    enabled: selectedWorkplaceId != null,
  });
  const { data: stackPollutants, isLoading: stackPollutantsLoading } = useStackPollutants(
    selectedStackId,
    { enabled: selectedStackId != null },
  );

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

  const { data: teamDetail } = useTeamDetail({
    id: selectedTeamId,
  });

  return {
    clientOptions,
    workplaceOptions,
    stackOptions,
    teamOptions,

    teamDetail,

    stackPollutants,
    stackPollutantsLoading,
  };
};
