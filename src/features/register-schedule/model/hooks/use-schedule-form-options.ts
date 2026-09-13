import { useClients } from "@entities/client";
import { useWorkplaces } from "@entities/workplace";
import { useStacks } from "@entities/stack";
import { useUsers } from "@entities/auth";
import { useTeams, useTeamDetail } from "@entities/team";
import { useStackPollutants } from "@entities/stack-pollutant";
import { MEASUREMENT_CYCLE } from "@shared/model";
import { MEASUREMENT_CYCLE_LABEL } from "@shared/config";
import type { SelectOption, SelectGroupOption } from "@shared/ui/form";

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
 *
 * 측정 팀은 목록과 별개로 **상세**를 함께 조회한다 — 그 팀에 등록된 사수·부사수를
 * 폼 기본값으로 채우기 위해서다(`teamDetail` 로 내보낸다).
 */
export const useScheduleFormOptions = ({ clientId, workplaceId, stackId, teamId }: Props) => {
  const selectedClientId = toId(clientId);
  const selectedWorkplaceId = toId(workplaceId);
  const selectedStackId = toId(stackId);
  const selectedTeamId = toId(teamId);

  const { data: clients } = useClients();
  const { data: users } = useUsers();
  const { data: teams } = useTeams();

  const { data: workplaces } = useWorkplaces(selectedClientId, {
    enabled: selectedClientId != null,
  });
  const { data: stacks } = useStacks(selectedWorkplaceId, {
    enabled: selectedWorkplaceId != null,
  });
  const { data: teamDetail } = useTeamDetail({ id: selectedTeamId });

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

  const userOptions: SelectOption[] = users.map((u) => ({
    value: String(u.userId),
    label: u.name,
  }));

  const teamOptions: SelectOption[] = teams.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  console.log(userOptions);

  // 측정항목은 **측정주기별 묶음**으로 고른다. 묶음 순서는 `MEASUREMENT_CYCLE` 선언 순서로
  // 고정한다 — 등록 순서에 따라 묶음이 흔들리면 안 된다(상세 화면·수정 폼과 같은 규칙).
  // 항목 라벨에 주기를 붙이지 않는 것은 그룹 머리글이 이미 말하기 때문이다.
  const pollutantGroups: SelectGroupOption[] = MEASUREMENT_CYCLE.map((cycle) => ({
    label: MEASUREMENT_CYCLE_LABEL[cycle],
    options: stackPollutants
      .filter((item) => item.pollutant.cycle === cycle)
      .map((item) => ({
        // value 는 **물질 id**(`pollutant.id`)다 — 목록 행 id(`item.id`)가 아니다.
        // 서버로 나가는 `ScheduleCreate.pollutantIds` 가 물질 id 를 받는다.
        value: String(item.pollutant.id),
        label: item.pollutant.nameKr,
      })),
  })).filter((group) => group.options.length > 0);

  return {
    clientOptions,
    workplaceOptions,
    stackOptions,
    userOptions,
    teamOptions,
    teamDetail,

    pollutantGroups,
    stackPollutantsLoading,
  };
};
