import { trimValue, unformatNumber } from '@shared/lib';
import type { WorkplaceRegisterRequest, WorkplaceUpdateRequest } from './dto';
import type { WorkplaceCreate, WorkplaceUpdate } from '../model/types';

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
