import { describe, expect, it } from 'vitest';

import { formatDate, formatDateDot, formatDateTime, formatMonthDay } from './date';

describe('formatDate 계열', () => {
  it('날짜만 있는 LocalDate 는 로컬 자정으로 읽어 하루 밀리지 않는다', () => {
    expect(formatDate('2026-08-15')).toBe('2026-08-15');
    expect(formatDateDot('2026-08-15')).toBe('2026.08.15');
  });

  it('LocalDateTime 은 로컬 시각으로 표시한다', () => {
    expect(formatDate('2026-08-15T23:30:00')).toBe('2026-08-15');
    expect(formatDateTime('2026-08-15T09:05:00')).toBe('2026-08-15 09시 05분');
  });

  it('Date 객체도 받는다', () => {
    expect(formatDate(new Date(2026, 0, 3))).toBe('2026-01-03');
  });

  it('비었거나 해석할 수 없으면 빈 문자열 — NaN 표기를 화면에 내보내지 않는다', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('')).toBe('');
    expect(formatDate('날짜 아님')).toBe('');
    expect(formatDateTime('2026-13-45T99:00:00')).toBe('');
  });
});

describe('formatMonthDay', () => {
  it('앞자리 0 을 떼고 월·일로 쓴다', () => {
    expect(formatMonthDay('2026-08-05')).toBe('8월 5일');
  });

  it('형식이 아니면 받은 그대로 돌려준다', () => {
    expect(formatMonthDay('미정')).toBe('미정');
    expect(formatMonthDay(null)).toBe('');
  });
});
