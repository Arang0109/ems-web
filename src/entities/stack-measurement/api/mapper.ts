import type { StackMeasurementListItem } from "../model/types";
import type { StackMeasurementTableResponse } from "./dto";

export const toStackMeasurementListItem = (
  dto: StackMeasurementTableResponse
): StackMeasurementListItem => ({
  id: dto.id,
  stack_id: dto.stack_id,
  pollutant: {
    id: dto.pollutant_id,
    nameKr: dto.nameKr,
    nameEn: dto.nameEn,
    cycle: dto.cycle,
    allowance: dto.allowance,
  }
});

export const toStackMeasurementListItems = (
  dtos: StackMeasurementTableResponse[]
): StackMeasurementListItem[] => dtos.map(toStackMeasurementListItem);