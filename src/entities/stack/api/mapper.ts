import { trimValue } from '@shared/lib';
import type { StackRegisterRequest, StackListResponse } from './dto';
import type { StackCreate, StackListItem } from '../model/types';

export const toRegisterRequest = (vo: StackCreate): StackRegisterRequest => ({
  workplaceId: vo.workplaceId,
  field: vo.field,
  name: trimValue(vo.name),
  semsNumber: trimValue(vo.semsNumber),
  grade: vo.grade,
  businessCategory: trimValue(vo.businessCategory),
  mainProduct: trimValue(vo.mainProduct),
});

export const toStackListItem = (dto: StackListResponse): StackListItem => ({
  id: dto.id,
  companyName: dto.companyName,
  workplaceName: dto.workplaceName,
  field: dto.field,
  stackName: dto.stackName,
  createdAt: dto.createdAt,
  modifiedAt: dto.modifiedAt,
})

export const toStackListItems = (
  dtos: StackListResponse[]
): StackListItem[] => 
  dtos.map(toStackListItem);
