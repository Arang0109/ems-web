import { describe, expect, it } from 'vitest';

import { formatClockTime, formatDayLabel, formatRelativeTime } from './date';

/** 기준 시각 — 2026-09-08(화) 14:30:00 */
const NOW = new Date(2026, 8, 8, 14, 30, 0);

describe('formatClockTime', () => {
  it('오전·오후를 12시간제로 표기한다', () => {
    expect(formatClockTime('2026-09-08T14:30:11')).toBe('오후 2:30');
    expect(formatClockTime('2026-09-08T09:05:00')).toBe('오전 9:05');
  });

  it('0시·12시는 0 이 아니라 12 로 적는다', () => {
    expect(formatClockTime('2026-09-08T00:30:00')).toBe('오전 12:30');
    expect(formatClockTime('2026-09-08T12:00:00')).toBe('오후 12:00');
  });

  it('빈 값·파싱 불가는 빈 문자열 — 화면에 "Invalid Date" 를 흘리지 않는다', () => {
    expect(formatClockTime(null)).toBe('');
    expect(formatClockTime(undefined)).toBe('');
    expect(formatClockTime('')).toBe('');
    expect(formatClockTime('말도 안 되는 값')).toBe('');
  });
});

describe('formatDayLabel', () => {
  it('오늘·어제는 날짜 대신 이름으로 부른다', () => {
    expect(formatDayLabel('2026-09-08T09:00:00', NOW)).toBe('오늘');
    expect(formatDayLabel('2026-09-07T23:59:00', NOW)).toBe('어제');
  });

  it('그 전은 요일까지 붙인 전체 날짜다', () => {
    expect(formatDayLabel('2026-09-06T10:00:00', NOW)).toBe('2026년 9월 6일 (일)');
    expect(formatDayLabel('2025-12-25T10:00:00', NOW)).toBe('2025년 12월 25일 (목)');
  });

  it('시각이 아니라 날짜로 가른다 — 23:59 와 00:01 은 하루 차이다', () => {
    // 경과 시간은 2분뿐이지만 자정을 넘었으므로 '어제'다
    expect(formatDayLabel('2026-09-07T23:59:00', new Date(2026, 8, 8, 0, 1, 0))).toBe('어제');
  });

  it('빈 값은 빈 문자열', () => {
    expect(formatDayLabel(null, NOW)).toBe('');
  });
});

describe('formatRelativeTime', () => {
  it('1분 미만은 "방금 전"', () => {
    expect(formatRelativeTime('2026-09-08T14:29:30', NOW)).toBe('방금 전');
    expect(formatRelativeTime('2026-09-08T14:30:00', NOW)).toBe('방금 전');
  });

  it('한 시간 안쪽은 분 단위로 센다', () => {
    expect(formatRelativeTime('2026-09-08T14:27:00', NOW)).toBe('3분 전');
    expect(formatRelativeTime('2026-09-08T13:31:00', NOW)).toBe('59분 전');
  });

  it('한 시간이 지나면 상대 표현을 버리고 시각을 보여준다', () => {
    expect(formatRelativeTime('2026-09-08T09:05:00', NOW)).toBe('오전 9:05');
  });

  it('어제·올해·작년을 단계적으로 성기게 적는다', () => {
    expect(formatRelativeTime('2026-09-07T22:00:00', NOW)).toBe('어제');
    expect(formatRelativeTime('2026-09-06T10:00:00', NOW)).toBe('9월 6일');
    expect(formatRelativeTime('2025-09-06T10:00:00', NOW)).toBe('2025. 9. 6.');
  });

  it('기기 시계가 앞서 미래 시각이 와도 "-3분 전"을 내지 않는다', () => {
    expect(formatRelativeTime('2026-09-08T14:33:00', NOW)).toBe('방금 전');
  });

  it('빈 값·파싱 불가는 빈 문자열', () => {
    expect(formatRelativeTime(null, NOW)).toBe('');
    expect(formatRelativeTime('말도 안 되는 값', NOW)).toBe('');
  });
});
