import { trimValue, unformatNumber } from '@shared/lib';
import type { WorkplaceRegisterRequest, WorkplaceUpdateRequest, WorkplaceListResponse } from './dto';
import type { WorkplaceCreate, WorkplaceUpdate, WorkplaceListItem } from '../model/types';

export const toRegisterRequest = (vo: WorkplaceCreate): WorkplaceRegisterRequest => ({
  clientId: vo.clientId,
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: trimValue(vo.address),
  grade: vo.grade,
});

export const toUpdateRequest = (vo: WorkplaceUpdate): WorkplaceUpdateRequest => ({
  name: trimValue(vo.name),
  bizNumber: unformatNumber(vo.bizNumber),
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: trimValue(vo.address),
  grade: vo.grade,
});

export const toWorkplaceListItem = (
  dto: WorkplaceListResponse
): WorkplaceListItem => ({
  id: dto.id,
  clientId: dto.clientId,
  clientName: dto.clientName,
  workplaceName: dto.workplaceName,
  zipcode: dto.zipcode,
  roadAddress: dto.roadAddress,
  detailAddress: dto.detailAddress,
  bizNumber: dto.bizNumber,
});

export const toWorkplaceListItems = (
  dtos: WorkplaceListResponse[]
): WorkplaceListItem[] =>
  dtos.map(toWorkplaceListItem);