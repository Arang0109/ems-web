import { describe, expect, it } from 'vitest';

import { formatBusinessNumber, formatPhoneNumber, unformatNumber } from './code';

describe('unformatNumber — 자릿수 코드 정규화', () => {
  it('숫자 외 문자를 모두 제거한다', () => {
    expect(unformatNumber('238-32-48234')).toBe('2383248234');
    expect(unformatNumber('010-1234-5678')).toBe('01012345678');
    expect(unformatNumber(' 02 )1234 ')).toBe('021234');
  });

  it('부호·소수점도 제거한다 — 숫자 "값" 이 아니라 코드용이다', () => {
    expect(unformatNumber('-12.5')).toBe('125');
  });

  it('빈값은 빈 문자열', () => {
    expect(unformatNumber('')).toBe('');
    expect(unformatNumber(null)).toBe('');
    expect(unformatNumber(undefined)).toBe('');
  });
});

describe('formatBusinessNumber — 3-2-5', () => {
  it('완성된 10자리를 하이픈으로 끊는다', () => {
    expect(formatBusinessNumber('2383248234')).toBe('238-32-48234');
    expect(formatBusinessNumber('238-32-48234')).toBe('238-32-48234');
  });

  it('타이핑 중인 미완성 값에 하이픈을 미리 붙이지 않는다', () => {
    expect(formatBusinessNumber('2')).toBe('2');
    expect(formatBusinessNumber('238')).toBe('238');
    expect(formatBusinessNumber('2383')).toBe('238-3');
    expect(formatBusinessNumber('23832')).toBe('238-32');
    expect(formatBusinessNumber('238324')).toBe('238-32-4');
  });

  it('10자리를 넘는 입력은 잘라낸다', () => {
    expect(formatBusinessNumber('23832482345678')).toBe('238-32-48234');
  });

  it('빈값은 빈 문자열', () => {
    expect(formatBusinessNumber('')).toBe('');
    expect(formatBusinessNumber(null)).toBe('');
    expect(formatBusinessNumber(undefined)).toBe('');
  });
});

describe('formatPhoneNumber — 3-4-나머지', () => {
  it('완성된 11자리를 하이픈으로 끊는다', () => {
    expect(formatPhoneNumber('01012345678')).toBe('010-1234-5678');
    expect(formatPhoneNumber('010-1234-5678')).toBe('010-1234-5678');
  });

  it('타이핑 중인 미완성 값에 하이픈을 미리 붙이지 않는다', () => {
    expect(formatPhoneNumber('0')).toBe('0');
    expect(formatPhoneNumber('010')).toBe('010');
    expect(formatPhoneNumber('0101')).toBe('010-1');
    expect(formatPhoneNumber('0101234')).toBe('010-1234');
    expect(formatPhoneNumber('01012345')).toBe('010-1234-5');
  });

  it('10자리 지역번호도 같은 규칙으로 끊는다 — 번호 체계를 판별하지 않는다', () => {
    expect(formatPhoneNumber('021234567')).toBe('021-2345-67');
  });

  it('11자리를 넘는 입력은 잘라낸다', () => {
    expect(formatPhoneNumber('010123456789999')).toBe('010-1234-5678');
  });

  it('빈값은 빈 문자열', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null)).toBe('');
    expect(formatPhoneNumber(undefined)).toBe('');
  });
});
