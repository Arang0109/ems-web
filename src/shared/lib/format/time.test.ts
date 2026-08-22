import { describe, expect, it } from 'vitest';

import {
  addMinutes,
  formatTime,
  fromMinutes,
  maskTimeInput,
  normalizeTime,
  toMinutes,
  unformatTime,
} from './time';

describe('toMinutes', () => {
  it('"HH:mm" 을 자정 기준 분으로 바꾼다', () => {
    expect(toMinutes('00:00')).toBe(0);
    expect(toMinutes('09:30')).toBe(570);
    expect(toMinutes('23:59')).toBe(1439);
  });

  it('빈 입력·파싱 불가는 null — 0 과 구분해야 한다', () => {
    expect(toMinutes('')).toBeNull();
    expect(toMinutes('--:--')).toBeNull();
    expect(toMinutes('abc')).toBeNull();
  });
});

describe('fromMinutes', () => {
  it('분을 "HH:mm" 으로 되돌린다', () => {
    expect(fromMinutes(0)).toBe('00:00');
    expect(fromMinutes(570)).toBe('09:30');
  });

  it('하루를 벗어나면 24시간으로 순환한다', () => {
    expect(fromMinutes(1450)).toBe('00:10');
    expect(fromMinutes(-10)).toBe('23:50');
    expect(fromMinutes(1440)).toBe('00:00');
  });
});

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

describe('maskTimeInput', () => {
  it('숫자만 치면 콜론을 끼워 넣는다', () => {
    expect(maskTimeInput('1')).toBe('1');
    expect(maskTimeInput('14')).toBe('14:');
    expect(maskTimeInput('143')).toBe('14:3');
    expect(maskTimeInput('1430')).toBe('14:30');
  });

  it('첫 자리가 3 이상이면 시가 확정되므로 앞당겨 분으로 넘긴다', () => {
    expect(maskTimeInput('3')).toBe('03:');
    expect(maskTimeInput('9')).toBe('09:');
  });

  it('앞 두 자리가 시로 성립하지 않으면 첫 자리만 시로 본다 (붙여넣기 보정)', () => {
    expect(maskTimeInput('930')).toBe('09:30');
    expect(maskTimeInput('2599')).toBe('02:59');
  });

  it('이미 콜론이 있는 값도 같은 결과로 수렴한다 (재입력 안정성)', () => {
    expect(maskTimeInput('14:30')).toBe('14:30');
    expect(maskTimeInput('14:')).toBe('14:');
  });

  it('숫자 아닌 문자는 버리고 4자리를 넘기면 자른다', () => {
    expect(maskTimeInput('가나14:30')).toBe('14:30');
    expect(maskTimeInput('143055')).toBe('14:30');
    expect(maskTimeInput('')).toBe('');
    expect(maskTimeInput('--:--')).toBe('');
  });
});

describe('normalizeTime', () => {
  it('자릿수만큼 채워 확정한다', () => {
    expect(normalizeTime('9')).toBe('09:00');
    expect(normalizeTime('14')).toBe('14:00');
    expect(normalizeTime('930')).toBe('09:30');
    expect(normalizeTime('1430')).toBe('14:30');
  });

  it('마스킹된 미완성 값도 그대로 받는다', () => {
    expect(normalizeTime('03:')).toBe('03:00');
    expect(normalizeTime('14:3')).toBe('14:03');
  });

  it('범위를 벗어난 분은 상한(59)으로 붙인다', () => {
    expect(normalizeTime('0299')).toBe('02:59');
    expect(normalizeTime('23:99')).toBe('23:59');
  });

  it('빈 입력은 "" — 0 시 0 분으로 바꾸지 않는다', () => {
    expect(normalizeTime('')).toBe('');
    expect(normalizeTime('--:--')).toBe('');
  });

  it('이미 확정된 값은 바뀌지 않는다', () => {
    expect(normalizeTime('00:00')).toBe('00:00');
    expect(normalizeTime('23:59')).toBe('23:59');
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
