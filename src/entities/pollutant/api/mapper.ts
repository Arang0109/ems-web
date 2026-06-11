import { trimValue } from '@shared/lib';
import type { PollutantRegisterRequest } from './dto';
import type { PollutantCreate } from '../model/types';

export const toRegisterRequest = (vo: PollutantCreate): PollutantRegisterRequest => ({
  field: vo.field,
  nameKr: trimValue(vo.nameKr),
  nameEn: trimValue(vo.nameEn),
  method: vo.method,
  phase: vo.phase,
  equipment: trimValue(vo.equipment),
  testMethod: trimValue(vo.testMethod),
});
