import type { StackMeasurementListItem } from "../model/types";
import type { StackMeasurementResponse } from "./dto";

export const toStackMeasurementListItem = (
  dto: StackMeasurementResponse
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
  dtos: StackMeasurementResponse[]
): StackMeasurementListItem[] => dtos.map(toStackMeasurementListItem);