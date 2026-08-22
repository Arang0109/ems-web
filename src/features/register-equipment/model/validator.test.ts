import { describe, expect, it } from 'vitest';

import { getDefaultEquipmentRegisterForm } from './types';
import type { EquipmentRegisterForm } from './types';
import {
  STEP_VALIDATORS,
  validateBasicStep,
  validateEquipmentFields,
  validateInspectionStep,
  validateSpecStep,
} from './validator';

const named = (form: EquipmentRegisterForm): EquipmentRegisterForm => ({
  ...form,
  equipmentName: '측정장비 1호',
});

describe('validateBasicStep', () => {
  it('종류·장비명 누락을 잡는다', () => {
    const errors = validateBasicStep(getDefaultEquipmentRegisterForm());
    expect(errors.type).toBeDefined();
    expect(errors.equipmentName).toBeDefined();
  });

  it('둘 다 채우면 통과한다', () => {
    expect(validateBasicStep(named(getDefaultEquipmentRegisterForm('NOZZLE')))).toEqual({});
  });
});

describe('validateSpecStep', () => {
  it('종류 미선택이면 사양을 검증하지 않는다 — 누락은 기본 정보 스텝이 잡는다', () => {
    expect(validateSpecStep(getDefaultEquipmentRegisterForm())).toEqual({});
  });

  it('노즐은 직경이 최소 1개 필요하다', () => {
    const form = named(getDefaultEquipmentRegisterForm('NOZZLE'));
    expect(validateSpecStep(form).spec).toBeDefined();

    const filled = { ...form, spec: { ...form.spec, diameters: [{ diameter: '5' }] } };
    expect(validateSpecStep(filled)).toEqual({});
  });

  it('가스분석기는 검증할 사양이 없다', () => {
    expect(validateSpecStep(named(getDefaultEquipmentRegisterForm('GAS_ANALYZER')))).toEqual({});
  });
});

describe('validateInspectionStep', () => {
  it('대상으로 체크한 검사의 주기가 0 이하면 잡는다', () => {
    const form = named(getDefaultEquipmentRegisterForm('NOZZLE'));
    const invalid = {
      ...form,
      inspections: form.inspections.map((item, i) =>
        i === 0 ? { ...item, enabled: true, cycleMonths: '0' } : item),
    };
    expect(validateInspectionStep(invalid).inspections).toBeDefined();
  });

  it('주기를 비워두는 것은 허용한다 (서버도 nullable)', () => {
    const form = named(getDefaultEquipmentRegisterForm('NOZZLE'));
    const blank = {
      ...form,
      inspections: form.inspections.map((item, i) =>
        i === 0 ? { ...item, enabled: true, cycleMonths: '' } : item),
    };
    expect(validateInspectionStep(blank)).toEqual({});
  });
});

describe('validateEquipmentFields', () => {
  /**
   * 이 회귀 테스트가 규칙을 강제한다 — 전체 검증은 스텝 검증의 합집합이어야 한다.
   * 어긋나면 마지막 스텝에서 제출할 때 앞 스텝의 누락을 놓치거나,
   * 반대로 '다음' 이 통과시킨 값이 제출에서 막힌다.
   */
  const cases: { name: string; form: EquipmentRegisterForm }[] = [
    { name: '빈 폼', form: getDefaultEquipmentRegisterForm() },
    { name: '노즐 미입력', form: getDefaultEquipmentRegisterForm('NOZZLE') },
    { name: '피토관 미입력', form: named(getDefaultEquipmentRegisterForm('PITOT_TUBE')) },
    { name: '가스분석기 정상', form: named(getDefaultEquipmentRegisterForm('GAS_ANALYZER')) },
    {
      name: '입자샘플러 일부 입력',
      form: (() => {
        const base = named(getDefaultEquipmentRegisterForm('PARTICLE_SAMPLER'));
        return { ...base, spec: { ...base.spec, totalVolume: '10' } };
      })(),
    },
  ];

  it.each(cases)('$name — 스텝 검증의 합집합과 같다', ({ form }) => {
    const union = Object.values(STEP_VALIDATORS).reduce(
      (errors, validate) => ({ ...errors, ...validate(form) }),
      {},
    );
    expect(validateEquipmentFields(form)).toEqual(union);
  });

  it('정상 입력이면 에러가 없다', () => {
    const base = named(getDefaultEquipmentRegisterForm('NOZZLE'));
    const form = { ...base, spec: { ...base.spec, diameters: [{ diameter: '5' }] } };
    expect(validateEquipmentFields(form)).toEqual({});
  });
});
