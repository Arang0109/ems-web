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
    oxygenApplicable: dto.oxygenApplicable,
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
  oxygenApplicable: vo.oxygenApplicable,
})

export const toRegisterStackPollutantRequests = (
  vos: StackPollutantCreate[]
): StackPollutantBatchRegisterRequest => vos.map(toRegisterStackPollutantRequest);