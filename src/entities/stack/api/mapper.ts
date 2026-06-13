import { trimValue } from '@shared/lib';
import type {
  StackRegisterRequest, StackListResponse, StackDetailResponse, StackUpdateRequest,
  FacilityRegisterRequest, FacilityUpdateRequest,
  PreventionRegisterRequest, PreventionUpdateRequest,
  TargetSubstanceRegisterRequest,
} from './dto';
import type {
  FacilityCreate, FacilityUpdate,
  StackCreate, StackDetail, StackListItem, StackUpdate,
  PreventionCreate, PreventionUpdate,
  TargetSubstanceCreate,
} from '../model/types';

export const toRegisterRequest = (vo: StackCreate): StackRegisterRequest => ({
  workplaceId: vo.workplaceId,
  field: vo.field,
  name: trimValue(vo.name),
  semsNumber: trimValue(vo.semsNumber),
  grade: vo.grade,
  businessCategory: trimValue(vo.businessCategory),
  mainProduct: trimValue(vo.mainProduct),
});

export const toRegisterFacilityRequest = (vo: FacilityCreate): FacilityRegisterRequest => ({
  stackId: vo.stackId,
  name: trimValue(vo.name),
  fuelUsage: trimValue(vo.fuelUsage),
  fuelInput: trimValue(vo.fuelInput),
  fuelType: trimValue(vo.fuelType)
})

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

export const toUpdateFacilityRequest = (vo: FacilityUpdate): FacilityUpdateRequest => ({
  name: trimValue(vo.name),
  fuelUsage: trimValue(vo.fuelUsage),
  fuelInput: trimValue(vo.fuelInput),
  fuelType: trimValue(vo.fuelType),
});

export const toRegisterPreventionRequest = (vo: PreventionCreate): PreventionRegisterRequest => ({
  stackId: vo.stackId,
  name: trimValue(vo.name),
});

export const toUpdatePreventionRequest = (vo: PreventionUpdate): PreventionUpdateRequest => ({
  name: trimValue(vo.name),
});

export const toRegisterSubstanceRequest = (vo: TargetSubstanceCreate): TargetSubstanceRegisterRequest => ({
  preventionId: vo.preventionId,
  name: trimValue(vo.name),
  removalEfficiency: trimValue(vo.removalEfficiency),
});

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
  preventions: (dto.preventions ?? []).map((data) => ({
    id: data.id,
    name: data.name,
    targets: (data.targets ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      removalEfficiency: t.removalEfficiency,
    })),
  })),
  facilities: (dto.facilities ?? []).map((data) => ({
    id: data.id,
    name: data.name,
    fuelUsage: data.fuelUsage,
    fuelInput: data.fuelInput,
    fuelType: data.fuelType,
  })),
});