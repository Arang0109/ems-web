import { describe, expect, it } from 'vitest';

import { maskNumericInput, normalizeNumericInput, toggleNumericSign } from './numeric-input';
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
});
