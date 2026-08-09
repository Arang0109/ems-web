import type { Stack } from "@entities/stack";
import type { StackPollutantListItem } from "@entities/stack-pollutant";
import type { MeasurementProfile, StackProfile } from "./types";
import {
  MEASUREMENT_FIELD_LABEL,
  GRADE_LABEL,
  SHAPE_LABEL,
  ORIENTATION_LABEL,
  MEASUREMENT_CYCLE_LABEL,
} from "@shared/config";

const value = (v?: string | null) => v?.trim() || "-";

export const toStackProfile = (data: Stack): StackProfile => {

  let diameter = "-";

  if (data.shape === "CIRCULAR") {
    diameter = `${value(data.horizontalLength)} m`;
  } else if (data.shape === "RECTANGULAR") {
    diameter = `${value(data.horizontalLength)} m × ${value(data.verticalLength)} m`;
  }

  return {
    field: data.field ? MEASUREMENT_FIELD_LABEL[data.field] : "-",
    name: value(data.name),
    semsNumber: value(data.semsNumber),
    grade: data.grade ? GRADE_LABEL[data.grade] : "-",
    businessCategory: value(data.businessCategory),
    mainProduct: value(data.mainProduct),
    height: value(data.height),
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
  nameKr: value(data.pollutant.nameKr),
  nameEn: value(data.pollutant.nameEn),
  cycle: MEASUREMENT_CYCLE_LABEL[data.pollutant.cycle] ?? data.pollutant.cycle,
  allowance: value(data.pollutant.allowance),
});