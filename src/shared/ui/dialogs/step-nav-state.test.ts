import { describe, expect, it, vi } from 'vitest';

import { clampStepIndex, firstInvalidStepIndex } from './step-nav-state';
import type { DialogStep } from './step-types';

/** content 는 렌더에만 쓰이므로 테스트에서는 null 로 둔다 */
const step = (id: string, validate?: () => boolean): DialogStep => ({
  id,
  label: id,
  content: null,
  validate,
});

describe('clampStepIndex', () => {
  it('범위 안의 인덱스는 그대로 둔다', () => {
    expect(clampStepIndex(0, 4)).toBe(0);
    expect(clampStepIndex(2, 4)).toBe(2);
    expect(clampStepIndex(3, 4)).toBe(3);
  });

  it('스텝이 줄어 범위를 넘으면 마지막 스텝으로 내린다', () => {
    // 사양 스텝이 사라져 4개 → 3개가 된 상황
    expect(clampStepIndex(3, 3)).toBe(2);
    expect(clampStepIndex(9, 3)).toBe(2);
  });

  it('음수는 0 으로 올린다', () => {
    expect(clampStepIndex(-1, 4)).toBe(0);
  });

  it('목록이 비면 0 을 돌려준다', () => {
    expect(clampStepIndex(2, 0)).toBe(0);
  });
});

describe('firstInvalidStepIndex', () => {
  it('전부 통과하면 -1', () => {
    expect(firstInvalidStepIndex([step('a', () => true), step('b', () => true)])).toBe(-1);
  });

  it('validate 가 없는 스텝은 통과로 본다', () => {
    expect(firstInvalidStepIndex([step('a'), step('b')])).toBe(-1);
    expect(firstInvalidStepIndex([step('a'), step('b', () => false)])).toBe(1);
  });

  it('첫 실패 스텝의 인덱스를 돌려준다', () => {
    const steps = [step('a', () => true), step('b', () => false), step('c', () => false)];
    expect(firstInvalidStepIndex(steps)).toBe(1);
  });

  it('첫 실패 이후는 검증하지 않는다 — 그 스텝으로 이동해 에러를 보여주기 때문', () => {
    const later = vi.fn(() => false);
    firstInvalidStepIndex([step('a', () => false), step('b', later)]);
    expect(later).not.toHaveBeenCalled();
  });

  it('빈 목록은 -1', () => {
    expect(firstInvalidStepIndex([])).toBe(-1);
  });
});
