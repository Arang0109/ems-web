import { describe, expect, it } from 'vitest';

import {
  exceedsDigitLimits, maskNumericInput, normalizeNumericInput, toggleNumericSign,
} from './numeric-input';
import { toNumberOrNull } from './number';

describe('maskNumericInput', () => {
  it('숫자·부호·소수점만 남긴다', () => {
    expect(maskNumericInput('12.5')).toBe('12.5');
    expect(maskNumericInput('1,234')).toBe('1234');
    expect(maskNumericInput('12abc3')).toBe('123');
    expect(maskNumericInput('1e5')).toBe('15');
  });

  it('타이핑 중인 미완성 값을 그대로 허용한다 — 여기서 지워지면 입력이 끊긴다', () => {
    expect(maskNumericInput('-')).toBe('-');
    expect(maskNumericInput('12.')).toBe('12.');
    expect(maskNumericInput('-.')).toBe('-.');
    expect(maskNumericInput('.')).toBe('.');
  });

  it('부호는 맨 앞 1 개, 소수점은 1 개만 남긴다', () => {
    expect(maskNumericInput('12-3')).toBe('123');
    expect(maskNumericInput('--12')).toBe('-12');
    expect(maskNumericInput('1.2.3')).toBe('1.23');
  });

  it('allowNegative 가 꺼지면 부호를 전부 버린다', () => {
    expect(maskNumericInput('-12.5', { allowNegative: false })).toBe('12.5');
    expect(maskNumericInput('-', { allowNegative: false })).toBe('');
  });
});

describe('maskNumericInput — 자릿수 제한', () => {
  it('정수부·소수부의 초과분을 버린다', () => {
    expect(maskNumericInput('12345', { maxIntDigits: 3 })).toBe('123');
    expect(maskNumericInput('1.2345', { maxDecimals: 2 })).toBe('1.23');
  });

  it('제한을 주지 않으면 예전 그대로다', () => {
    expect(maskNumericInput('123456.789')).toBe('123456.789');
    expect(maskNumericInput('123456.789', { allowNegative: false })).toBe('123456.789');
  });

  it('부호는 자릿수로 세지 않는다', () => {
    expect(maskNumericInput('-123', { maxIntDigits: 3 })).toBe('-123');
    expect(maskNumericInput('-1234', { maxIntDigits: 3 })).toBe('-123');
  });

  it('미완성 값은 제한 아래에서도 살아 있다 — 여기서 지워지면 입력이 끊긴다', () => {
    expect(maskNumericInput('-', { maxIntDigits: 2 })).toBe('-');
    expect(maskNumericInput('12.', { maxIntDigits: 2, maxDecimals: 2 })).toBe('12.');
    expect(maskNumericInput('.', { maxDecimals: 2 })).toBe('.');
  });

  it('maxDecimals 가 0 이면 소수점 자체를 받지 않는다', () => {
    expect(maskNumericInput('12.5', { maxDecimals: 0 })).toBe('12');
    expect(maskNumericInput('12.', { maxDecimals: 0 })).toBe('12');
    expect(maskNumericInput('.', { maxDecimals: 0 })).toBe('');
  });

  it('선행 0 은 자릿수로 세지 않는다 — 0 부터 치는 입력이 막히면 안 된다', () => {
    expect(maskNumericInput('007', { maxIntDigits: 2 })).toBe('007');
    expect(maskNumericInput('0012345', { maxIntDigits: 3 })).toBe('00123');
  });

  it('소수의 후행 0 은 센다 — 측정값의 유효숫자 정보다', () => {
    expect(maskNumericInput('1.50', { maxDecimals: 2 })).toBe('1.50');
    expect(maskNumericInput('1.50', { maxDecimals: 1 })).toBe('1.5');
  });

  it('붙여넣기는 앞자리를 남기고 자른다', () => {
    expect(maskNumericInput('1234567.89', { maxIntDigits: 4, maxDecimals: 1 })).toBe('1234.8');
  });

  it('부호 금지와 자릿수가 함께 걸린다', () => {
    expect(maskNumericInput('-1234', { allowNegative: false, maxIntDigits: 2 })).toBe('12');
  });
});

describe('exceedsDigitLimits', () => {
  it('제한 안이면 false', () => {
    expect(exceedsDigitLimits('123.4', { maxIntDigits: 3, maxDecimals: 1 })).toBe(false);
  });

  it('정수부·소수부 초과는 true', () => {
    expect(exceedsDigitLimits('1234', { maxIntDigits: 3 })).toBe(true);
    expect(exceedsDigitLimits('1.23', { maxDecimals: 1 })).toBe(true);
  });

  it('음수도 부호를 빼고 센다', () => {
    expect(exceedsDigitLimits('-99', { maxIntDigits: 2 })).toBe(false);
    expect(exceedsDigitLimits('-999', { maxIntDigits: 2 })).toBe(true);
  });

  it('제한이 없으면 항상 false', () => {
    expect(exceedsDigitLimits('123456.789')).toBe(false);
  });

  it('지수 표기는 제한 밖으로 본다 — 타이핑으로 만들 수 없는 값이다', () => {
    expect(exceedsDigitLimits('1e-7', { maxDecimals: 9 })).toBe(true);
  });
});

describe('toggleNumericSign', () => {
  it('부호를 뒤집는다', () => {
    expect(toggleNumericSign('12.5')).toBe('-12.5');
    expect(toggleNumericSign('-12.5')).toBe('12.5');
  });

  it('빈 값이면 부호만 남긴다 — 부호부터 누르고 숫자를 치는 흐름', () => {
    expect(toggleNumericSign('')).toBe('-');
    expect(toggleNumericSign('-')).toBe('');
  });
});

describe('normalizeNumericInput', () => {
  it('미완성 입력을 확정한다', () => {
    expect(normalizeNumericInput('12.')).toBe('12');
    expect(normalizeNumericInput('.5')).toBe('0.5');
    expect(normalizeNumericInput('-.5')).toBe('-0.5');
    expect(normalizeNumericInput('007')).toBe('7');
  });

  it('값이 아닌 입력은 빈 문자열 — 0 으로 바꾸지 않는다', () => {
    expect(normalizeNumericInput('')).toBe('');
    expect(normalizeNumericInput('-')).toBe('');
    expect(normalizeNumericInput('.')).toBe('');
    expect(normalizeNumericInput('-.')).toBe('');
  });

  it('음수와 0 을 보존하되 -0 은 만들지 않는다', () => {
    expect(normalizeNumericInput('-12.5')).toBe('-12.5');
    expect(normalizeNumericInput('0')).toBe('0');
    expect(normalizeNumericInput('-0')).toBe('0');
    expect(normalizeNumericInput('-0.0')).toBe('0.0');
  });

  it('후행 0 은 남긴다 — 측정값의 유효숫자 정보다', () => {
    expect(normalizeNumericInput('1.50')).toBe('1.50');
    expect(normalizeNumericInput('0.00012')).toBe('0.00012');
  });

  it('확정값은 기존 폼 파서가 그대로 읽는다', () => {
    expect(toNumberOrNull(normalizeNumericInput('-12.5'))).toBe(-12.5);
    expect(toNumberOrNull(normalizeNumericInput('-'))).toBeNull();
  });

  // 이 불변식 덕분에 확정 단계(onBlur)에서 자릿수를 다시 검사하지 않아도 된다.
  it('마스킹을 통과한 값은 확정 뒤에도 제한 안이다', () => {
    const limits = { maxIntDigits: 1, maxDecimals: 1 };

    // `".5"` → `"0.5"` 로 정수부가 늘지만 그 0 은 선행 0 이라 세지 않는다
    expect(exceedsDigitLimits(normalizeNumericInput(maskNumericInput('.5', limits)), limits))
      .toBe(false);
  });

  it('확정은 자릿수를 줄이기만 한다', () => {
    expect(exceedsDigitLimits(normalizeNumericInput('007'), { maxIntDigits: 2 })).toBe(false);
    expect(exceedsDigitLimits(normalizeNumericInput('12.'), { maxIntDigits: 2 })).toBe(false);
  });

  it('후행 0 보존과 자릿수 제한이 함께 성립한다', () => {
    expect(normalizeNumericInput(maskNumericInput('1.50', { maxDecimals: 2 }))).toBe('1.50');
  });
});
