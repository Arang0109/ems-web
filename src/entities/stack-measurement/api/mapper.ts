import type { StackMeasurementCreate, StackMeasurementListItem } from "../model/types";
import type { StackMeasurementRegisterRequest, StackMeasurementTableResponse, StackMeasurementBatchRegisterRequest } from "./dto";

export const toStackMeasurementListItem = (
  dto: StackMeasurementTableResponse
): StackMeasurementListItem => ({
  id: dto.id,
  stackId: dto.stackId,
  pollutant: {
    id: dto.pollutantId,
    nameKr: dto.nameKr,
    nameEn: dto.nameEn,
    cycle: dto.cycle,
    allowance: dto.allowance,
  }
});

export const toStackMeasurementListItems = (
  dtos: StackMeasurementTableResponse[]
): StackMeasurementListItem[] => dtos.map(toStackMeasurementListItem);

export const toRegisterStackMeasurementRequest = (
  vo: StackMeasurementCreate
): StackMeasurementRegisterRequest => ({
  stackId: vo.stackId,
  pollutantId: vo.pollutantId,
  cycle: vo.cycle,
  allowance: vo.allowance,
})

export const toRegisterStackMeasurementRequests = (
  vos: StackMeasurementCreate[]
): StackMeasurementBatchRegisterRequest => vos.map(toRegisterStackMeasurementRequest);