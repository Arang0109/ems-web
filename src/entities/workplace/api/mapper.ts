import { trimValue, unformatNumber } from '@shared/lib';
import type { WorkplaceRegisterRequest, WorkplaceUpdateRequest, WorkplaceListResponse } from './dto';
import type { WorkplaceCreate, WorkplaceUpdate, WorkplaceListItem } from '../model/types';

export const toRegisterRequest = (vo: WorkplaceCreate): WorkplaceRegisterRequest => ({
  companyId: vo.companyId,
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  address: trimValue(vo.address),
});

export const toUpdateRequest = (vo: WorkplaceUpdate): WorkplaceUpdateRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  address: trimValue(vo.address),
});

export const toWorkplaceListItem = (
  dto: WorkplaceListResponse
): WorkplaceListItem => ({
  id: dto.id,
  companyId: dto.companyId,
  companyName: dto.companyName,
  workplaceName: dto.workplaceName,
  address: dto.address,
  bizNumber: dto.bizNumber,
});

export const toWorkplaceListItems = (
  dtos: WorkplaceListResponse[]
): WorkplaceListItem[] =>
  dtos.map(toWorkplaceListItem);