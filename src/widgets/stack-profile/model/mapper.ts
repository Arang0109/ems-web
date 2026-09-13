import type { Stack } from "@entities/stack";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import type { MeasurementCycleGroup, MeasurementProfile, StackProfile } from "./types";
import { displayValue } from "@shared/lib";
import {
  MEASUREMENT_FIELD_LABEL,
  GRADE_LABEL,
  SHAPE_LABEL,
  ORIENTATION_LABEL,
  MEASUREMENT_CYCLE_LABEL,
} from "@shared/config";
import { MEASUREMENT_CYCLE } from "@shared/model";

export const toStackProfile = (data: Stack): StackProfile => {

  let diameter = "-";

  if (data.shape === "CIRCULAR") {
    diameter = `${displayValue(data.horizontalLength)} m`;
  } else if (data.shape === "RECTANGULAR") {
    diameter = `${displayValue(data.horizontalLength)} m × ${displayValue(data.verticalLength)} m`;
  }

  return {
    field: data.field ? MEASUREMENT_FIELD_LABEL[data.field] : "-",
    name: displayValue(data.name),
    semsNumber: displayValue(data.semsNumber),
    grade: data.grade ? GRADE_LABEL[data.grade] : "-",
    mainProduct: displayValue(data.mainProduct),
    standardOxygen: `${displayValue(data.standardOxygen)} %`,
    height: `${displayValue(data.height)} m`,
    diameter,
    shape: data.shape ? SHAPE_LABEL[data.shape] : "-",
    orientation: data.orientation
      ? ORIENTATION_LABEL[data.orientation]
      : "-",
  };
};

export const toMeasurementProfiles = (
  data: StackPollutantListItem[]
): MeasurementProfile[] => data.map(toMeasurementProfile);

const toMeasurementProfile = (data: StackPollutantListItem): MeasurementProfile => ({
  id: data.id,
  nameKr: displayValue(data.pollutant.nameKr),
  nameEn: displayValue(data.pollutant.nameEn),
  cycle: data.pollutant.cycle,
  allowance: displayValue(data.pollutant.allowance),
  oxygenApplicable: data.pollutant.oxygenApplicable,
});

/**
 * 측정항목을 측정주기별로 묶는다.
 *
 * 주기 순서는 상수 배열(잦은 주기 → 드문 주기)을 따라 항상 같게 두고,
 * 등록된 항목이 없는 주기는 카드 자체를 만들지 않는다.
 */
export const groupMeasurementsByCycle = (
  measurements: MeasurementProfile[],
): MeasurementCycleGroup[] => {
  const byCycle = new Map<MeasurementProfile["cycle"], MeasurementProfile[]>();

  measurements.forEach((measurement) => {
    const found = byCycle.get(measurement.cycle);
    if (found) found.push(measurement);
    else byCycle.set(measurement.cycle, [measurement]);
  });

  return MEASUREMENT_CYCLE.filter((cycle) => byCycle.has(cycle)).map((cycle) => ({
    cycle,
    label: MEASUREMENT_CYCLE_LABEL[cycle] ?? cycle,
    items: byCycle.get(cycle) ?? [],
  }));
};