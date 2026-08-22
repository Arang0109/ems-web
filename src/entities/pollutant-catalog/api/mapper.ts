import { trimValue } from '@shared/lib';
import type {
  PollutantCatalogRegisterRequest, PollutantCatalogResponse, PollutantCatalogUpdateRequest,
} from './dto';
import type { PollutantCatalog, PollutantCatalogCreate, PollutantCatalogUpdate } from '../model/types';

/** 자유 입력 문자열은 `''` 로 접고, 열거값·순서는 "미지정"을 구분해야 하므로 null 을 유지한다. */
export const toPollutantCatalog = (dto: PollutantCatalogResponse): PollutantCatalog => ({
  id: dto.id,
  code: dto.code,
  field: dto.field,
  nameKr: dto.nameKr,
  method: dto.method,
  phase: dto.phase,
  sortOrder: dto.sortOrder,
  active: dto.active,
});

export const toPollutantCatalogs = (dtos: PollutantCatalogResponse[]): PollutantCatalog[] =>
  dtos.map(toPollutantCatalog);

export const toRegisterRequest = (vo: PollutantCatalogCreate): PollutantCatalogRegisterRequest => ({
  code: trimValue(vo.code),
  field: vo.field,
  nameKr: trimValue(vo.nameKr),
  method: vo.method,
  phase: vo.phase,
  sortOrder: vo.sortOrder,
});

export const toUpdateRequest = (vo: PollutantCatalogUpdate): PollutantCatalogUpdateRequest => ({
  field: vo.field,
  nameKr: trimValue(vo.nameKr),
  method: vo.method,
  phase: vo.phase,
  sortOrder: vo.sortOrder,
});
