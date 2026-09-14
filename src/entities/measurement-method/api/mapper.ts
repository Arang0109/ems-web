import { trimValue } from '@shared/lib';
import type {
  MeasurementMethodRegisterRequest, MeasurementMethodResponse, MeasurementMethodUpdateRequest,
} from './dto';
import type { MeasurementMethod, MeasurementMethodCreate, MeasurementMethodUpdate } from '../model/types';

/** 통칭명은 자유 입력 문자열이라 `''` 로 접는다. 채취시간은 "미지정"이 뜻을 가져 null 을 그대로 둔다. */
export const toMeasurementMethod = (dto: MeasurementMethodResponse): MeasurementMethod => ({
  id: dto.id,
  name: dto.name,
  sampleGrouping: dto.sampleGrouping,
  mergedSampleName: dto.mergedSampleName ?? '',
  samplingMinutes: dto.samplingMinutes,
  sortOrder: dto.sortOrder,
});

export const toMeasurementMethods = (dtos: MeasurementMethodResponse[]): MeasurementMethod[] =>
  dtos.map(toMeasurementMethod);

/** 빈 통칭명은 null 로 — 서버는 `MERGED` 가 아닌 채취 단위에 통칭명이 오면 400 이다. */
const trimOrNull = (value: string | null): string | null =>
  value === null ? null : (trimValue(value) || null);

export const toRegisterRequest = (vo: MeasurementMethodCreate): MeasurementMethodRegisterRequest => ({
  name: trimValue(vo.name),
  sampleGrouping: vo.sampleGrouping,
  mergedSampleName: trimOrNull(vo.mergedSampleName),
  samplingMinutes: vo.samplingMinutes,
  sortOrder: vo.sortOrder,
});

export const toUpdateRequest = (vo: MeasurementMethodUpdate): MeasurementMethodUpdateRequest => ({
  name: trimOrNull(vo.name),
  sampleGrouping: vo.sampleGrouping,
  mergedSampleName: trimOrNull(vo.mergedSampleName),
  samplingMinutes: vo.samplingMinutes,
});
