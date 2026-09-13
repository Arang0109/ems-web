import { describe, expect, it } from 'vitest';

import {
  displayValue, formatNumber, isNonNegativeNumber, isPositiveNumber, roundHalfUp,
  toFormValue, toKoreanAmount, toNumber, toNumberOrNull,
} from './number';

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

  it('decimals 는 min·max 를 같은 값으로 주는 축약이다 — toFixed(n) 자리', () => {
    expect(formatNumber(1234.5678, { decimals: 2 })).toBe('1,234.57');
    expect(formatNumber(1234, { decimals: 2 })).toBe('1,234.00');
    expect(formatNumber(2.5, { decimals: 0 })).toBe('3');
    expect(formatNumber(null, { decimals: 2 })).toBe('');
  });

  it('decimals 가 min·max 보다 우선한다', () => {
    expect(formatNumber(1.5, { decimals: 1, minDecimals: 3, maxDecimals: 3 })).toBe('1.5');
  });
});

describe('displayValue — 없는 값을 대시로', () => {
  it('null·undefined·공백은 대시', () => {
    expect(displayValue(null)).toBe('-');
    expect(displayValue(undefined)).toBe('-');
    expect(displayValue('')).toBe('-');
    expect(displayValue('   ')).toBe('-');
  });

  it('0 은 값이다', () => {
    expect(displayValue(0)).toBe('0');
  });

  it('숫자는 문자열로, 문자열은 앞뒤 공백을 지운다', () => {
    expect(displayValue(12.5)).toBe('12.5');
    expect(displayValue(' abc ')).toBe('abc');
  });

  it('대시 문자를 바꿀 수 있다', () => {
    expect(displayValue(null, '—')).toBe('—');
  });

  it('formatNumber 와 이어 쓰면 "없음" 과 "포맷된 값" 이 갈린다', () => {
    expect(displayValue(formatNumber(null, { decimals: 2 }))).toBe('-');
    expect(displayValue(formatNumber(1.005, { decimals: 2 }))).toBe('1.01');
  });
});

describe('roundHalfUp — BigDecimal HALF_UP 미러', () => {
  it('소수 scale 자리에서 반올림한다', () => {
    expect(roundHalfUp(1.2345, 2)).toBe(1.23);
    expect(roundHalfUp(1.235, 2)).toBe(1.24);
    expect(roundHalfUp(0.7071, 3)).toBe(0.707);
  });

  it('.5 는 부호와 무관하게 절대값이 커지는 쪽으로 — JS Math.round 와 다르다', () => {
    expect(roundHalfUp(2.5, 0)).toBe(3);
    expect(roundHalfUp(-2.5, 0)).toBe(-3);
    expect(Math.round(-2.5)).toBe(-2);
  });

  it('fp 표현 오차를 흡수한다 (1.005 * 100 === 100.49999…)', () => {
    expect(roundHalfUp(1.005, 2)).toBe(1.01);
  });

  it('NaN·Infinity 는 그대로', () => {
    expect(roundHalfUp(Number.NaN, 1)).toBeNaN();
    expect(roundHalfUp(Number.POSITIVE_INFINITY, 1)).toBe(Number.POSITIVE_INFINITY);
  });
});

describe('isPositiveNumber / isNonNegativeNumber — Form 문자열 판정', () => {
  it('빈값·파싱 불가는 둘 다 false', () => {
    for (const v of ['', '  ', 'abc', null, undefined]) {
      expect(isPositiveNumber(v)).toBe(false);
      expect(isNonNegativeNumber(v)).toBe(false);
    }
  });

  it('0 에서 갈린다', () => {
    expect(isPositiveNumber('0')).toBe(false);
    expect(isNonNegativeNumber('0')).toBe(true);
  });

  it('음수는 둘 다 false, 양수는 둘 다 true', () => {
    expect(isPositiveNumber('-1')).toBe(false);
    expect(isNonNegativeNumber('-1')).toBe(false);
    expect(isPositiveNumber('1,234.5')).toBe(true);
    expect(isNonNegativeNumber('1,234.5')).toBe(true);
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
