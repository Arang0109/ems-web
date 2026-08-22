import type { MeasurementItemSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import { MEASUREMENT_CYCLE_LABEL } from "@shared/config";
import { MEASUREMENT_CYCLE } from "@shared/model";
import type { MeasurementCycle } from "@shared/model";

import type { ScheduleItemGroup, ScheduleItemOption } from "./types";

const text = (v?: string | number | null): string => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s === "" ? "-" : s;
};

/**
 * 선택 가능한 측정항목 목록을 주기별로 묶는다.
 *
 * 원장(측정시설의 측정항목)이 기준이지만, 계획을 세운 뒤 원장에서 빠진 항목이 스냅샷에 남아 있을 수 있다.
 * 그 항목도 목록에 넣어야(`isRetired`) 체크가 켜진 상태로 보이고, 무심코 사라지지 않는다.
 * 허용기준·산소보정 적용 여부는 이미 포함된 항목이면 측정 시점 값(스냅샷)이 정확하므로 그쪽을 우선한다.
 */
export const toItemGroups = (
  stackPollutants: StackPollutantListItem[],
  items: MeasurementItemSnapshot[],
): ScheduleItemGroup[] => {
  const itemByPollutantId = new Map(items.map((item) => [item.pollutantId, item]));
  const covered = new Set<number>();
  const byCycle = new Map<MeasurementCycle, ScheduleItemOption[]>();

  const push = (cycle: MeasurementCycle, option: ScheduleItemOption) => {
    const found = byCycle.get(cycle);
    if (found) found.push(option);
    else byCycle.set(cycle, [option]);
  };

  stackPollutants.forEach(({ pollutant }) => {
    const item = itemByPollutantId.get(pollutant.id);
    covered.add(pollutant.id);
    push(pollutant.cycle, {
      pollutantId: pollutant.id,
      nameKr: text(pollutant.nameKr),
      allowance: text(item ? item.allowance : pollutant.allowance),
      oxygenApplicable: item ? item.oxygenApplicable : pollutant.oxygenApplicable,
      cycle: pollutant.cycle,
      isRetired: false,
    });
  });

  items
    .filter((item) => !covered.has(item.pollutantId))
    .forEach((item) => {
      push(item.cycle, {
        pollutantId: item.pollutantId,
        nameKr: text(item.nameKr),
        allowance: text(item.allowance),
        oxygenApplicable: item.oxygenApplicable,
        cycle: item.cycle,
        isRetired: true,
      });
    });

  // 주기는 정의 순서(상시→연1회…)로 고정한다 — 등록 순서에 따라 묶음 순서가 흔들리지 않게.
  return MEASUREMENT_CYCLE
    .filter((cycle) => byCycle.has(cycle))
    .map((cycle) => ({
      cycle,
      label: MEASUREMENT_CYCLE_LABEL[cycle] ?? cycle,
      options: byCycle.get(cycle) ?? [],
    }));
};
