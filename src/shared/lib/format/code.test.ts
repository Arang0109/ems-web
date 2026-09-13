import { describe, expect, it } from 'vitest';

import {
  BUSINESS_NUMBER_DIGITS, PHONE_NUMBER_DIGITS,
  formatBusinessNumber, formatPhoneNumber, maskCodeInput, unformatNumber,
} from './code';

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

describe('maskCodeInput — 입력 중인 코드 정규화', () => {
  it('자릿수 상수는 표시 묶음의 합이다', () => {
    expect(BUSINESS_NUMBER_DIGITS).toBe(10);
    expect(PHONE_NUMBER_DIGITS).toBe(11);
  });

  it('숫자만 남기고 상한에서 자른다', () => {
    expect(maskCodeInput('238-32-48234-999', BUSINESS_NUMBER_DIGITS)).toBe('2383248234');
    expect(maskCodeInput('010 1234 5678', PHONE_NUMBER_DIGITS)).toBe('01012345678');
  });

  it('상한을 채운 뒤 더 붙여도 늘어나지 않는다', () => {
    expect(maskCodeInput('23832482349', BUSINESS_NUMBER_DIGITS)).toBe('2383248234');
  });

  it('부호·소수점은 지운다 — 숫자 "값" 마스킹과 다른 줄기다', () => {
    expect(maskCodeInput('-12.5', BUSINESS_NUMBER_DIGITS)).toBe('125');
  });

  it('빈값은 빈 문자열', () => {
    expect(maskCodeInput('', BUSINESS_NUMBER_DIGITS)).toBe('');
    expect(maskCodeInput(null, PHONE_NUMBER_DIGITS)).toBe('');
    expect(maskCodeInput(undefined, PHONE_NUMBER_DIGITS)).toBe('');
  });

  it('정규화한 값을 표시 포맷으로 되돌릴 수 있다', () => {
    expect(formatBusinessNumber(maskCodeInput('2383248234567', BUSINESS_NUMBER_DIGITS)))
      .toBe('238-32-48234');
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
