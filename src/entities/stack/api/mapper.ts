import { trimValue } from '@shared/lib';
import type { StackRegisterRequest } from './dto';
import type { StackCreate } from '../model/types';

export const toRegisterRequest = (vo: StackCreate): StackRegisterRequest => ({
  workplaceId: vo.workplaceId,
  field: vo.field,
  name: trimValue(vo.name),
  semsNumber: trimValue(vo.semsNumber),
  grade: vo.grade,
  businessCategory: trimValue(vo.businessCategory),
  mainProduct: trimValue(vo.mainProduct),
});
