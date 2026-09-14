import { trimValue } from '@shared/lib';
import type {
  PollutantCandidateResponse, PollutantResponse,
  PollutantRegisterRequest, PollutantUpdateRequest,
} from './dto';
import type { Pollutant, PollutantCandidate, PollutantCreate, PollutantUpdate } from '../model/types';

/**
 * 자유 입력 문자열은 `''` 로 접어 화면·폼이 null 분기를 하지 않게 한다.
 * 반면 `methodId`·`sampleGrouping`·`phase`·`samplingMinutes` 는 id·열거값·수치라 빈 문자열 자리가 없어
 * null 을 그대로 둔다 — 폼에서는 `Select` 의 미선택(`''`)으로 옮긴다.
 */
export const toPollutant = (dto: PollutantResponse): Pollutant => ({
  id: dto.id,
  catalogId: dto.catalogId,
  code: dto.code,
  field: dto.field,
  nameKr: dto.nameKr,
  nameEn: dto.nameEn ?? '',
  methodId: dto.methodId,
  methodName: dto.methodName ?? '',
  sampleGrouping: dto.sampleGrouping,
  mergedSampleName: dto.mergedSampleName ?? '',
  samplingMinutes: dto.samplingMinutes,
  methodSamplingMinutes: dto.methodSamplingMinutes,
  effectiveSamplingMinutes: dto.effectiveSamplingMinutes,
  phase: dto.phase,
  mode: dto.mode,
  equipment: dto.equipment ?? '',
  testMethod: dto.testMethod ?? '',
});

export const toPollutants = (dtos: PollutantResponse[]): Pollutant[] => dtos.map(toPollutant);

export const toPollutantCandidate = (dto: PollutantCandidateResponse): PollutantCandidate => ({
  catalogId: dto.catalogId,
  code: dto.code,
  field: dto.field,
  nameKr: dto.nameKr,
  phase: dto.phase,
  mode: dto.mode,
  sortOrder: dto.sortOrder,
});

export const toPollutantCandidates = (
  dtos: PollutantCandidateResponse[],
): PollutantCandidate[] => dtos.map(toPollutantCandidate);

/** null 은 "가이드 국문명 복사" 또는 "기존 값 유지"라는 의미를 갖는다 — 빈 문자열로 접지 않는다. */
const trimOrNull = (value: string | null): string | null =>
  value === null ? null : trimValue(value);

export const toRegisterRequest = (vo: PollutantCreate): PollutantRegisterRequest => ({
  catalogId: vo.catalogId,
  methodId: vo.methodId,
  samplingMinutes: vo.samplingMinutes,
  nameKr: trimOrNull(vo.nameKr),
  nameEn: trimOrNull(vo.nameEn),
  equipment: trimOrNull(vo.equipment),
  testMethod: trimOrNull(vo.testMethod),
});

export const toUpdateRequest = (vo: PollutantUpdate): PollutantUpdateRequest => ({
  methodId: vo.methodId,
  samplingMinutes: vo.samplingMinutes,
  nameKr: trimOrNull(vo.nameKr),
  nameEn: trimOrNull(vo.nameEn),
  equipment: trimOrNull(vo.equipment),
  testMethod: trimOrNull(vo.testMethod),
});
