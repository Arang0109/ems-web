import type { StackPollutantCreate, StackPollutantListItem } from "../model/types";
import type { StackPollutantRegisterRequest, StackPollutantTableResponse, StackPollutantBatchRegisterRequest } from "./dto";

export const toStackPollutantListItem = (
  dto: StackPollutantTableResponse
): StackPollutantListItem => ({
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

export const toStackPollutantListItems = (
  dtos: StackPollutantTableResponse[]
): StackPollutantListItem[] => dtos.map(toStackPollutantListItem);

export const toRegisterStackPollutantRequest = (
  vo: StackPollutantCreate
): StackPollutantRegisterRequest => ({
  stackId: vo.stackId,
  pollutantId: vo.pollutantId,
  cycle: vo.cycle,
  allowance: vo.allowance,
})

export const toRegisterStackPollutantRequests = (
  vos: StackPollutantCreate[]
): StackPollutantBatchRegisterRequest => vos.map(toRegisterStackPollutantRequest);