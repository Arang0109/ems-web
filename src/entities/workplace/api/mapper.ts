import type { WorkplaceRegisterRequest, WorkplaceUpdateRequest, WorkplaceListResponse } from './dto';
import type { WorkplaceCreate, WorkplaceUpdate, WorkplaceListItem } from '../model/types';

export const toRegisterRequest = (vo: WorkplaceCreate): WorkplaceRegisterRequest => ({
  clientId: vo.clientId,
  name: vo.name,
  bizNumber: vo.bizNumber,
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: vo.address,
  facilityManager: vo.facilityManager,
  samplingWitness: vo.samplingWitness,
  grade: vo.grade,
});

export const toUpdateRequest = (vo: WorkplaceUpdate): WorkplaceUpdateRequest => ({
  name: vo.name,
  bizNumber: vo.bizNumber,
  zipcode: vo.zipcode,
  roadAddress: vo.roadAddress,
  detailAddress: vo.address,
  facilityManager: vo.facilityManager,
  samplingWitness: vo.samplingWitness,
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
  facilityManager: dto.facilityManager,
  samplingWitness: dto.samplingWitness,
  grade: dto.grade,
});

export const toWorkplaceListItems = (
  dtos: WorkplaceListResponse[]
): WorkplaceListItem[] =>
  dtos.map(toWorkplaceListItem);