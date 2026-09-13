import { describe, expect, it } from 'vitest';

import { getDefaultEquipmentRegisterForm } from './types';
import type { EquipmentRegisterForm, EquipmentSpecForm } from './types';
import { getEquipmentStepProgress, getVisibleEquipmentSteps } from './step-progress';

const formWithSpec = (
  form: EquipmentRegisterForm,
  spec: Partial<EquipmentSpecForm>,
): EquipmentRegisterForm => ({ ...form, spec: { ...form.spec, ...spec } });

describe('getVisibleEquipmentSteps', () => {
  it('가스분석기는 사양 스텝을 노출하지 않는다', () => {
    const steps = getVisibleEquipmentSteps('GAS_ANALYZER');
    expect(steps).toHaveLength(3);
    expect(steps.map((s) => s.id)).not.toContain('spec');
  });

  it('사양이 있는 종류는 4스텝을 전부 노출한다', () => {
    expect(getVisibleEquipmentSteps('NOZZLE')).toHaveLength(4);
    expect(getVisibleEquipmentSteps('PARTICLE_SAMPLER')).toHaveLength(4);
  });

  it('종류 미선택도 전부 노출한다 — 무엇이 필요한지 아직 모른다', () => {
    expect(getVisibleEquipmentSteps('')).toHaveLength(4);
  });
});

describe('getEquipmentStepProgress', () => {
  it('기본 정보는 필수 2개(종류·장비명)를 센다', () => {
    const empty = getDefaultEquipmentRegisterForm();
    expect(getEquipmentStepProgress(empty, 'basic')).toEqual({ done: 0, total: 2 });

    const typed = getDefaultEquipmentRegisterForm('NOZZLE');
    expect(getEquipmentStepProgress(typed, 'basic')).toEqual({ done: 1, total: 2 });

    expect(getEquipmentStepProgress({ ...typed, equipmentName: '노즐 1호' }, 'basic'))
      .toEqual({ done: 2, total: 2 });
  });

  it('공백만 입력한 장비명은 세지 않는다', () => {
    const form = { ...getDefaultEquipmentRegisterForm('NOZZLE'), equipmentName: '   ' };
    expect(getEquipmentStepProgress(form, 'basic')).toEqual({ done: 1, total: 2 });
  });

  it('구매 정보·검사 항목은 필수가 없어 배지를 띄우지 않는다 (total 0)', () => {
    const form = getDefaultEquipmentRegisterForm('NOZZLE');
    expect(getEquipmentStepProgress(form, 'purchase').total).toBe(0);
    expect(getEquipmentStepProgress(form, 'inspection').total).toBe(0);
  });

  it('입자샘플러 사양은 3개를 센다', () => {
    const form = getDefaultEquipmentRegisterForm('PARTICLE_SAMPLER');
    expect(getEquipmentStepProgress(form, 'spec')).toEqual({ done: 0, total: 3 });

    const partial = formWithSpec(form, { totalVolume: '10', yd: '0' });
    expect(getEquipmentStepProgress(partial, 'spec')).toEqual({ done: 2, total: 3 });
  });

  it('가스샘플러·기타 사양은 적산량 1개', () => {
    const gas = getDefaultEquipmentRegisterForm('GAS_SAMPLER');
    expect(getEquipmentStepProgress(gas, 'spec')).toEqual({ done: 0, total: 1 });
    expect(getEquipmentStepProgress(formWithSpec(gas, { totalVolume: '5' }), 'spec'))
      .toEqual({ done: 1, total: 1 });
  });

  it('피토관은 종류 1 + 계수 행당 2를 센다', () => {
    const form = getDefaultEquipmentRegisterForm('PITOT_TUBE');
    // 행이 없어도 "1개 이상" 규칙이 있으므로 분모는 1행치를 잡는다
    expect(getEquipmentStepProgress(form, 'spec')).toEqual({ done: 0, total: 3 });

    const filled = formWithSpec(form, {
      pitotTubeType: 'DUST',
      coefficients: [{ coefficient: '0.84', velocity: '10' }, { coefficient: '0.85', velocity: '' }],
    });
    expect(getEquipmentStepProgress(filled, 'spec')).toEqual({ done: 4, total: 5 });
  });

  it('노즐은 직경 행 수를 센다', () => {
    const form = getDefaultEquipmentRegisterForm('NOZZLE');
    expect(getEquipmentStepProgress(form, 'spec')).toEqual({ done: 0, total: 1 });

    const filled = formWithSpec(form, { diameters: [{ diameter: '5' }, { diameter: '' }] });
    expect(getEquipmentStepProgress(filled, 'spec')).toEqual({ done: 1, total: 2 });
  });

  it('가스분석기·종류 미선택은 셀 사양이 없다', () => {
    expect(getEquipmentStepProgress(getDefaultEquipmentRegisterForm('GAS_ANALYZER'), 'spec'))
      .toEqual({ done: 0, total: 0 });
    expect(getEquipmentStepProgress(getDefaultEquipmentRegisterForm(), 'spec'))
      .toEqual({ done: 0, total: 0 });
  });

  it('0 은 유효한 입력이라 센다 (미입력과 구분)', () => {
    const form = getDefaultEquipmentRegisterForm('GAS_SAMPLER');
    expect(getEquipmentStepProgress(formWithSpec(form, { totalVolume: '0' }), 'spec').done).toBe(1);
  });
});
