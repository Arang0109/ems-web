import { describe, expect, it } from 'vitest';

import { addMinutes, formatTime, unformatTime } from './time';

describe('addMinutes', () => {
  it('분을 더해 "HH:mm" 으로 반환한다', () => {
    expect(addMinutes('09:00', 30)).toBe('09:30');
    expect(addMinutes('09:45', 30)).toBe('10:15');
  });

  it('자정을 넘기면 24시간으로 순환한다', () => {
    expect(addMinutes('23:30', 45)).toBe('00:15');
    expect(addMinutes('00:00', 1440)).toBe('00:00');
    expect(addMinutes('12:00', 1500)).toBe('13:00');
  });

  it('음수 분은 뒤로 되감고, 자정 이전으로 넘어가도 순환한다', () => {
    expect(addMinutes('00:10', -20)).toBe('23:50');
  });

  it('소수 분은 반올림한다 (채취시간 합계가 소수일 수 있다)', () => {
    expect(addMinutes('09:00', 30.4)).toBe('09:30');
    expect(addMinutes('09:00', 30.6)).toBe('09:31');
  });

  it('0 분을 더하면 시각이 유지된다', () => {
    expect(addMinutes('09:00', 0)).toBe('09:00');
  });

  it('빈 입력·파싱 불가는 null — 표시용 대체값은 호출부가 정한다', () => {
    expect(addMinutes('', 30)).toBeNull();
    expect(addMinutes('--:--', 30)).toBeNull();
    expect(addMinutes('abc', 30)).toBeNull();
  });
});

describe('formatTime / unformatTime', () => {
  it('서버 "HH:mm:ss" 와 input 값 "HH:mm" 을 왕복 변환한다', () => {
    expect(formatTime('09:30:00')).toBe('09:30');
    expect(unformatTime('09:30')).toBe('09:30:00');
  });

  it('빈 값은 각각 "" 와 null 이다', () => {
    expect(formatTime(null)).toBe('');
    expect(formatTime(undefined)).toBe('');
    expect(unformatTime('   ')).toBeNull();
  });
});
