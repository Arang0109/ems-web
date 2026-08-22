import type { EquipType } from "@shared/model";

import type { EquipmentRegisterForm, EquipmentSpecForm } from "./types";
import { isNonNegative, isPositive } from "./validator";

export type EquipmentStepId = 'basic' | 'purchase' | 'inspection' | 'spec';

interface EquipmentStep {
  id: EquipmentStepId;
  label: string;
  /** 가스분석기는 사양 항목이 없어 이 스텝을 노출하지 않는다 */
  gasAnalyzerHidden?: boolean;
}

export const EQUIPMENT_STEPS: EquipmentStep[] = [
  { id: 'basic', label: '기본 정보' },
  { id: 'purchase', label: '구매 정보' },
  { id: 'inspection', label: '검사 종류' },
  { id: 'spec', label: '상세스펙', gasAnalyzerHidden: true },
];

/**
 * 화면에 노출할 스텝 목록.
 *
 * 조건부 스텝은 플래그로 숨기지 않고 배열에서 빼서 표현한다 —
 * `steps.length` 가 곧 보이는 스텝 수여야 위저드의 인덱스 계산에 예외가 없다.
 * 종류 미선택('')은 아직 무엇이 필요한지 모르므로 전부 노출한다.
 */
export const getVisibleEquipmentSteps = (type: EquipType | ''): EquipmentStep[] =>
  EQUIPMENT_STEPS.filter((step) => !(step.gasAnalyzerHidden && type === 'GAS_ANALYZER'));

/**
 * 사양 스텝의 필수 입력 수 — 종류별로 다르다.
 *
 * 배열형(피토관 계수·노즐 직경)은 "1개 이상"이 규칙이라 행이 없을 때도 분모를 1행치로 잡는다.
 * 그래야 배지가 `1/1` 인데 검증에 걸리는 모순이 생기지 않는다.
 */
const getSpecProgress = (
  type: EquipType | '',
  spec: EquipmentSpecForm,
): { done: number; total: number } => {
  switch (type) {
    case 'PARTICLE_SAMPLER': {
      const filled = [spec.totalVolume, spec.orificeDp, spec.yd].filter(isNonNegative).length;
      return { done: filled, total: 3 };
    }
    case 'GAS_SAMPLER':
    case 'OTHER':
      return { done: isNonNegative(spec.totalVolume) ? 1 : 0, total: 1 };
    case 'PITOT_TUBE': {
      const rows = Math.max(spec.coefficients.length, 1);
      const filledRows = spec.coefficients.filter((c) => isPositive(c.coefficient)).length
        + spec.coefficients.filter((c) => isPositive(c.velocity)).length;
      return { done: (spec.pitotTubeType ? 1 : 0) + filledRows, total: 1 + rows * 2 };
    }
    case 'NOZZLE': {
      const rows = Math.max(spec.diameters.length, 1);
      const filled = spec.diameters.filter((d) => isPositive(d.diameter)).length;
      return { done: filled, total: rows };
    }
    // 가스분석기는 사양이 없고, 종류 미선택이면 아직 셀 대상이 없다.
    default:
      return { done: 0, total: 0 };
  }
};

/**
 * 스텝 헤더의 진행도 배지 값.
 *
 * **필수 입력만 센다.** 이 폼은 필수가 장비 종류·장비명뿐이라 모든 입력을 세면
 * 제출할 수 있는데도 미완성으로 읽힌다. 배지의 의미는 "이 스텝을 통과하려면 남은 입력"이며,
 * 분모는 `validator.ts` 와 같은 규칙에서 파생시켜 둘이 어긋나지 않게 한다.
 * `total: 0` 이면 `StepNav` 가 배지를 렌더하지 않는다.
 */
export const getEquipmentStepProgress = (
  form: EquipmentRegisterForm,
  id: EquipmentStepId,
): { done: number; total: number } => {
  switch (id) {
    case 'basic': {
      const done = (form.type ? 1 : 0) + (form.equipmentName.trim() ? 1 : 0);
      return { done, total: 2 };
    }
    case 'spec':
      return getSpecProgress(form.type, form.spec);
    // 구매 정보는 전부 선택 입력이고, 검사 항목은 "값이 있으면 양수" 조건부 규칙이라 셀 대상이 없다.
    case 'purchase':
    case 'inspection':
      return { done: 0, total: 0 };
  }
};
