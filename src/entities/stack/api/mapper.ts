import { trimValue } from '@shared/lib';
import type { StackRegisterRequest, StackListResponse, StackDetailResponse, StackUpdateRequest } from './dto';
import type { StackCreate, StackDetail, StackListItem, StackUpdate } from '../model/types';

export const toRegisterRequest = (vo: StackCreate): StackRegisterRequest => ({
  workplaceId: vo.workplaceId,
  field: vo.field,
  name: trimValue(vo.name),
  semsNumber: trimValue(vo.semsNumber),
  grade: vo.grade,
  businessCategory: trimValue(vo.businessCategory),
  mainProduct: trimValue(vo.mainProduct),
});

export const toUpdateRequest = (vo: StackUpdate): StackUpdateRequest => ({
  field: vo.field,
  name: trimValue(vo.name),
  semsNumber: trimValue(vo.semsNumber),
  grade: vo.grade,
  businessCategory: trimValue(vo.businessCategory),
  mainProduct: trimValue(vo.mainProduct),
  height: vo.height,
  horizontalLength: vo.horizontalLength,
  verticalLength: vo.verticalLength,
  shape: vo.shape,
  orientation: vo.orientation,
})

export const toStackListItem = (dto: StackListResponse): StackListItem => ({
  id: dto.id,
  companyName: dto.companyName,
  workplaceName: dto.workplaceName,
  field: dto.field,
  stackName: dto.stackName,
  createdAt: dto.createdAt,
  modifiedAt: dto.modifiedAt,
});

export const toStackListItems = (dtos: StackListResponse[]): StackListItem[] => dtos.map(toStackListItem);

export const toStackDetail = (dto: StackDetailResponse): StackDetail => ({
  stack: {
    id: dto.id,
    workplaceId: dto.workplaceId,
    field: dto.field,
    name: dto.name,
    semsNumber: dto.semsNumber,
    grade: dto.grade,
    businessCategory: dto.businessCategory,
    mainProduct: dto.mainProduct,
    height: dto.height,
    horizontalLength: dto.horizontalLength,
    verticalLength: dto.verticalLength,
    shape: dto.shape,
    orientation: dto.orientation,
    createdAt: dto.createdAt,
    modifiedAt: dto.modifiedAt
  },
  preventions: dto.preventions.map((data) => ({
    id: data.id,
    name: data.name,
    targets: data.targets.map((t) => ({
      id: t.id,
      name: t.name,
      removalEfficiency: t.removalEfficiency,
    })),
  })),
  facilities: dto.facilities.map((data) => ({
    id: data.id,
    name: data.name,
    fuelUsage: data.fuelUsage,
    fuelInput: data.fuelInput,
    fuelType: data.fuelType
  }))
});