import { describe, expect, it } from 'vitest';

import { formatNumber, toFormValue, toKoreanAmount, toNumber, toNumberOrNull } from './number';

describe('toFormValue — Domain(number | null) → Form(string)', () => {
  it('null·undefined 는 빈 문자열로 — 이 함수의 존재 이유(String(null) === "null" 방지)', () => {
    expect(toFormValue(null)).toBe('');
    expect(toFormValue(undefined)).toBe('');
  });

  it('0 은 빈 문자열이 아니다 — "미지정"과 "0"을 구분한다', () => {
    expect(toFormValue(0)).toBe('0');
  });

  it('숫자를 문자열로 변환한다', () => {
    expect(toFormValue(1234)).toBe('1234');
    expect(toFormValue(-0.5)).toBe('-0.5');
  });

  it('문자열은 그대로 통과시킨다', () => {
    expect(toFormValue('')).toBe('');
    expect(toFormValue('abc')).toBe('abc');
  });

  it('toNumberOrNull 의 역방향이다 (왕복 후 값이 보존된다)', () => {
    for (const v of [0, 1234, -0.5, null]) {
      expect(toNumberOrNull(toFormValue(v))).toBe(v);
    }
  });

  it('toNumber 는 null 을 0 으로 되돌린다 (필수 필드용 — 왕복 비대칭이 의도된 지점)', () => {
    expect(toNumber(toFormValue(null))).toBe(0);
  });
});

describe('toNumber / toNumberOrNull — Form(string) → Domain(number)', () => {
  it('콤마·공백을 제거하고 파싱한다', () => {
    expect(toNumber('1,234,567')).toBe(1234567);
    expect(toNumberOrNull(' 12.5 ')).toBe(12.5);
    expect(toNumber('-0.5')).toBe(-0.5);
  });

  it('빈값의 처리가 갈린다 — 필수는 0, 선택은 null', () => {
    expect(toNumber('')).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumberOrNull('')).toBeNull();
    expect(toNumberOrNull(undefined)).toBeNull();
  });

  it('파싱 불가도 같은 규칙을 따른다', () => {
    expect(toNumber('abc')).toBe(0);
    expect(toNumberOrNull('abc')).toBeNull();
  });
});

describe('formatNumber', () => {
  it('천 단위 구분 기호를 넣는다', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber('1234567')).toBe('1,234,567');
  });

  it('0 은 표시하고 빈값만 빈 문자열이다', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber('')).toBe('');
    expect(formatNumber(null)).toBe('');
  });

  it('자릿수를 생략하면 로케일 기본값(소수 3자리)으로 반올림한다', () => {
    expect(formatNumber(0.0004)).toBe('0');
    expect(formatNumber(1.5)).toBe('1.5');
  });

  it('maxDecimals 는 소수를 그만큼 살리되 뒤 0 은 붙이지 않는다', () => {
    expect(formatNumber(0.0004, { maxDecimals: 6 })).toBe('0.0004');
    expect(formatNumber('1234.5678', { maxDecimals: 6 })).toBe('1,234.5678');
    expect(formatNumber(1234.5, { maxDecimals: 6 })).toBe('1,234.5');
    expect(formatNumber(1234.5678, { maxDecimals: 0 })).toBe('1,235');
  });

  it('minDecimals 는 모자란 소수 자리를 0 으로 채운다', () => {
    expect(formatNumber(1234.5, { minDecimals: 2 })).toBe('1,234.50');
    expect(formatNumber(1234, { minDecimals: 2 })).toBe('1,234.00');
    expect(formatNumber('0', { minDecimals: 2 })).toBe('0.00');
  });

  it('minDecimals 가 기본 최대치(3)보다 커도 RangeError 없이 채운다', () => {
    expect(formatNumber(1.5, { minDecimals: 5 })).toBe('1.50000');
  });

  it('min·max 를 같게 주면 자릿수가 고정된다', () => {
    expect(formatNumber(1234.5678, { minDecimals: 2, maxDecimals: 2 })).toBe('1,234.57');
    expect(formatNumber(1234, { minDecimals: 2, maxDecimals: 2 })).toBe('1,234.00');
  });
});

describe('toKoreanAmount', () => {
  it('조·억·만 단위로 끊어 한글로 읽는다', () => {
    expect(toKoreanAmount(120_000_000)).toBe('금 일억이천만원');
    expect(toKoreanAmount(5000)).toBe('금 오천원');
    expect(toKoreanAmount('1,234')).toBe('금 일천이백삼십사원');
  });

  it('0 과 빈값은 병기하지 않는다', () => {
    expect(toKoreanAmount(0)).toBe('');
    expect(toKoreanAmount('')).toBe('');
    expect(toKoreanAmount(null)).toBe('');
  });
});
