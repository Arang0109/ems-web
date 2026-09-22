import { trimValue } from '@shared/lib';
import type {
  CustomFieldDefinitionRegisterRequest, CustomFieldDefinitionResponse, CustomFieldDefinitionUpdateRequest,
} from './dto';
import type { ScheduleCustomField, ScheduleCustomFieldCreate, ScheduleCustomFieldUpdate } from '../model/types';

export const toScheduleCustomField = (dto: CustomFieldDefinitionResponse): ScheduleCustomField => ({
  id: dto.id,
  key: dto.key,
  label: dto.label,
  sortOrder: dto.sortOrder,
});

export const toScheduleCustomFields = (dtos: CustomFieldDefinitionResponse[]): ScheduleCustomField[] =>
  dtos.map(toScheduleCustomField);

export const toRegisterRequest = (vo: ScheduleCustomFieldCreate): CustomFieldDefinitionRegisterRequest => ({
  key: trimValue(vo.key),
  label: trimValue(vo.label),
  sortOrder: vo.sortOrder,
});

/** 빈 라벨은 null 로 — 서버는 null 을 "기존 값 유지"로 읽는다. */
export const toUpdateRequest = (vo: ScheduleCustomFieldUpdate): CustomFieldDefinitionUpdateRequest => ({
  label: vo.label === null ? null : (trimValue(vo.label) || null),
  sortOrder: vo.sortOrder,
});
