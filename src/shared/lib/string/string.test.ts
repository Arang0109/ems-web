import { describe, expect, it } from 'vitest';

import { formatAddress } from './address';
import { trimValue } from './trim-value';

describe('trimValue', () => {
  it('앞뒤 공백을 지우고 null·undefined 는 빈 문자열로', () => {
    expect(trimValue('  사업장  ')).toBe('사업장');
    expect(trimValue(null)).toBe('');
    expect(trimValue(undefined)).toBe('');
  });
});

describe('formatAddress', () => {
  it('도로명과 상세주소를 한 칸 띄워 잇는다', () => {
    expect(formatAddress('서울시 강남구 테헤란로 1', '10층')).toBe('서울시 강남구 테헤란로 1 10층');
  });

  it('상세주소가 비어도 끝에 공백이 남지 않는다', () => {
    expect(formatAddress('서울시 강남구 테헤란로 1', '')).toBe('서울시 강남구 테헤란로 1');
    expect(formatAddress('서울시 강남구 테헤란로 1', '  ')).toBe('서울시 강남구 테헤란로 1');
  });
});
