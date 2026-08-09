import { describe, expect, it } from 'vitest';

import { toFormValue } from './form-value';
import { toNumber, toNumberOrNull } from './number';

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
