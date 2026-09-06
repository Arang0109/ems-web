import type { EquipmentSnapshot, EquipmentSpec, MeasurementItemSnapshot } from "@entities/schedule";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import {
  MEASUREMENT_FIELD_LABEL, GRADE_LABEL, SHAPE_LABEL, ORIENTATION_LABEL,
  PITOT_TUBE_TYPE_LABEL, MEASUREMENT_CYCLE_LABEL,
} from "@shared/config";
import { EQUIP_TYPE, MEASUREMENT_CYCLE } from "@shared/model";
import type { EquipType, MeasurementCycle, Shape } from "@shared/model";

import type { EquipmentSpecItem, PollutantChipItem, PollutantCycleGroup, ReportItem } from "./types";

export const value = (v?: string | number | null): string => {
  if (v === null || v === undefined) return "-";
  const s = String(v).trim();
  return s === "" ? "-" : s;
};

export const fieldLabel = (v?: string | null): string =>
  v ? (MEASUREMENT_FIELD_LABEL[v as keyof typeof MEASUREMENT_FIELD_LABEL] ?? v) : "-";
export const gradeLabel = (v?: string | null): string =>
  v ? (GRADE_LABEL[v as keyof typeof GRADE_LABEL] ?? v) : "-";
export const shapeLabel = (v?: string | null): string =>
  v ? (SHAPE_LABEL[v as keyof typeof SHAPE_LABEL] ?? v) : "-";
export const orientationLabel = (v?: string | null): string =>
  v ? (ORIENTATION_LABEL[v as keyof typeof ORIENTATION_LABEL] ?? v) : "-";

// 측정시설 치수(원형=지름, 사각형=가로×세로) 표시
export const describeDimension = (
  shape: Shape, horizontal: number | null, vertical: number | null,
): string => {
  if (shape === "CIRCULAR") return `${value(horizontal)} m`;
  if (shape === "RECTANGULAR") return `${value(horizontal)} m × ${value(vertical)} m`;
  return "-";
};

// 장비 카드 정렬 — 피그마 시안의 입자샘플러 → 가스샘플러 → 피토관 → 노즐 순서.
// 서버 스냅샷의 배열 순서는 보장되지 않으므로 표시 직전에 맞춘다.
export const sortEquipmentsByType = (equipments: EquipmentSnapshot[]): EquipmentSnapshot[] =>
  [...equipments].sort((a, b) => EQUIP_TYPE.indexOf(a.type) - EQUIP_TYPE.indexOf(b.type));

// 장비 사양(spec)을 type에 따라 사람이 읽을 수 있는 항목으로 변환한다.
// spec에는 판별 필드가 없으므로 EquipmentSnapshot.type으로 형태를 판별한다.
export const describeEquipmentSpec = (equip: EquipmentSnapshot): EquipmentSpecItem[] => {
  const spec = equip.spec;
  if (!spec) return [];

  switch (equip.type as EquipType) {
    case "PARTICLE_SAMPLER": {
      const s = spec as Extract<EquipmentSpec, { orificeDp: number }>;
      return [
        { label: "적산량", value: value(s.totalVolume) },
        { label: "오리피스 보정계수", value: value(s.orificeDp) },
        { label: "Yd", value: value(s.yd) },
      ];
    }
    case "GAS_SAMPLER":
    case "OTHER": {
      const s = spec as Extract<EquipmentSpec, { totalVolume: number }>;
      return [{ label: "적산량", value: value(s.totalVolume) }];
    }
    case "PITOT_TUBE": {
      const s = spec as Extract<EquipmentSpec, { pitotTubeType: unknown }>;
      return [
        { label: "피토우관 유형", value: PITOT_TUBE_TYPE_LABEL[s.pitotTubeType] ?? String(s.pitotTubeType) },
        { label: "피토관 계수", chips: s.coefficients?.map((c) => String(c.coefficient)) ?? [] },
      ];
    }
    case "NOZZLE": {
      const s = spec as Extract<EquipmentSpec, { diameters: unknown }>;
      return [{ label: "노즐 직경 (cm)", chips: s.diameters?.map((d) => String(d.diameter)) ?? [] }];
    }
    default:
      return [];
  }
};

// 측정항목을 측정주기별로 묶는다.
// 측정시설 원장(stackPollutants)이 그 주기의 전체 항목이고, 그중 이번 측정계획에
// 포함된 것(items)만 current 로 갈라 담는다. 원장을 아직 못 받아왔거나 원장에서
// 사라진 항목도 누락되면 안 되므로 items 쪽을 한 번 더 훑어 보충한다.
export const groupPollutantsByCycle = (
  items: MeasurementItemSnapshot[],
  stackPollutants: StackPollutantListItem[],
  standardOxygen: number | null,
): PollutantCycleGroup[] => {
  const itemByPollutantId = new Map(items.map((item) => [item.pollutantId, item]));
  const groups = new Map<MeasurementCycle, PollutantCycleGroup>();

  const groupOf = (cycle: MeasurementCycle): PollutantCycleGroup => {
    const found = groups.get(cycle);
    if (found) return found;

    const created: PollutantCycleGroup = {
      cycle,
      label: MEASUREMENT_CYCLE_LABEL[cycle] ?? cycle,
      current: [],
      others: [],
    };
    groups.set(cycle, created);
    return created;
  };

  const covered = new Set<number>();

  stackPollutants.forEach((row) => {
    const { pollutant } = row;
    const item = itemByPollutantId.get(pollutant.id);
    const chip: PollutantChipItem = {
      key: `stack-pollutant-${row.id}`,
      pollutantId: pollutant.id,
      stackPollutantId: row.id,
      name: value(pollutant.nameKr),
      // 허용기준·산소보정은 측정 당시 값이 정확하므로 포함 항목은 스냅샷 값을 쓴다.
      allowance: value(item ? item.allowance : pollutant.allowance),
      standardOxygen: value(standardOxygen),
      oxygenApplicable: item ? item.oxygenApplicable : pollutant.oxygenApplicable,
    };

    if (item) {
      covered.add(pollutant.id);
      groupOf(pollutant.cycle).current.push(chip);
    } else {
      groupOf(pollutant.cycle).others.push(chip);
    }
  });

  items
    .filter((item) => !covered.has(item.pollutantId))
    .forEach((item) => {
      groupOf(item.cycle).current.push({
        key: `item-${item.stackPollutantId}`,
        pollutantId: item.pollutantId,
        stackPollutantId: item.stackPollutantId,
        name: value(item.nameKr),
        allowance: value(item.allowance),
        standardOxygen: value(standardOxygen),
        oxygenApplicable: item.oxygenApplicable,
      });
    });

  // 주기 순서는 상수 배열(잦은 주기 → 드문 주기)을 따라 항상 같게 둔다.
  return MEASUREMENT_CYCLE.map((cycle) => groups.get(cycle)).filter(
    (group): group is PollutantCycleGroup => group !== undefined,
  );
};

// 성적서 탭용 측정항목 목록. 스냅샷 배열 순서가 곧 성적서의 표기 순서이므로 정렬하지 않고 그대로 옮긴다.
// 측정주기로 묶지 않는 것도 같은 이유다 — 성적서 순서는 계획 전체에 대한 하나의 순서다.
export const toReportItems = (
  items: MeasurementItemSnapshot[],
  standardOxygen: number | null,
): ReportItem[] =>
  items.map((item) => ({
    // SortableList 가 id: number 를 요구한다. 측정계획 문서 안에서 측정물질은 유일하다.
    id: item.pollutantId,
    name: value(item.nameKr),
    allowance: value(item.allowance),
    standardOxygen: value(standardOxygen),
    oxygenApplicable: item.oxygenApplicable,
  }));
