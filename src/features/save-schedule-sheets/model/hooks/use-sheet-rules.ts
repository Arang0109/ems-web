import { useMemo } from "react";

import type { ScheduleSnapshot } from "@entities/schedule";

import type { SheetForm } from "../types";
import { getAssignedPollutants } from "../input/measured-pollutants";
import {
  buildGasSampleGroups, getUnassignedGroupsFor, getUnresolvedItems,
} from "../gaseous/gaseous-rows";
import { buildSampleRules } from "../gaseous/sample-rules";

interface Params {
  snapshot: ScheduleSnapshot | null;
  sheets: SheetForm[];
  activeSheet: SheetForm | null;
}

/**
 * 측정계획의 측정항목(`snapshot.items`)에서 파생되는 규칙 묶음. 측정항목은 측정계획 단위라 시트별로 갈리지 않으므로
 * 스냅샷에서 한 번만 파생하고, 기록지 상태(`sheets`)를 함께 봐야 하는 것(미배정 판정)만 그것을 따라간다.
 *
 * 전부 순수 파생(useMemo)이다 — effect 로 상태를 동기화하지 않는다.
 */
export const useSheetRules = ({ snapshot, sheets, activeSheet }: Params) => {
  // 측정항목에서 파생한 가스상 시료 행. 자동 채움·원격 병합·409 복구가 같은 목록을 본다.
  const gasSampleGroups = useMemo(
    () => buildGasSampleGroups(snapshot?.items ?? []),
    [snapshot?.items],
  );

  // 이 측정계획에 배정된 THC·NOx·SOx — 필수 칸 판정(저장 검증·진행도 배지·미입력 강조)이 모두 이 값을 본다.
  const assignedPollutants = useMemo(
    () => getAssignedPollutants(snapshot?.items),
    [snapshot?.items],
  );

  // 아직 어느 기록지에도 적히지 않은 가스상 항목 중 활성 기록지에 적을 수 있는 것. 배정 여부는 기록지 하나가
  // 아니라 전체를 가로질러 판정하므로 첫 기록지에 몰아 적는 방식도, 칸이 넘쳐 다음 기록지로 넘기는 방식도
  // 그대로 성립한다. 등속흡인 항목(비소화합물)만은 그 입자상 기록지에서만 미배정으로 보인다.
  const unassignedGroups = useMemo(
    () => (activeSheet ? getUnassignedGroupsFor(gasSampleGroups, sheets, activeSheet.category) : []),
    [gasSampleGroups, sheets, activeSheet],
  );

  // 카탈로그 투영값이 없어 자동으로 만들 수 없는 항목 — 화면에서 수동 추가를 안내한다.
  const unresolvedItems = useMemo(
    () => getUnresolvedItems(snapshot?.items ?? []),
    [snapshot?.items],
  );

  // 가스상 행의 파생 규칙(등속흡인 잠금·종료시각 기본값). 행이 담은 항목에서 유도되므로 항목 스냅샷을 따라간다.
  const sampleRules = useMemo(
    () => buildSampleRules(snapshot?.items ?? []),
    [snapshot?.items],
  );

  return { gasSampleGroups, assignedPollutants, unassignedGroups, unresolvedItems, sampleRules };
};
