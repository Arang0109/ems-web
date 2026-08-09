import type { EquipmentRegisterForm, EquipmentSpecForm, InspectionItemForm } from "./types";
import type { EquipType } from "@shared/model";

const isPositive = (v: string) => v.trim() !== '' && Number(v) > 0;
const isNonNegative = (v: string) => v.trim() !== '' && Number(v) >= 0;

// 유형별 spec 검증 — 문제가 있으면 spec 레벨 메시지를 반환한다.
export const validateEquipmentSpec = (type: EquipType, spec: EquipmentSpecForm): string | undefined => {
  switch (type) {
    case 'PARTICLE_SAMPLER':
      if (![spec.totalVolume, spec.orificeDp, spec.yd].every(isNonNegative)) {
        return '총유량·오리피스 ΔP·Yd 값을 모두 입력해주세요.';
      }
      return undefined;
    case 'GAS_SAMPLER':
    case 'OTHER':
      if (!isNonNegative(spec.totalVolume)) return '총유량을 입력해주세요.';
      return undefined;
    case 'PITOT_TUBE':
      if (!spec.pitotTubeType) return '피토관 종류를 선택해주세요.';
      if (spec.coefficients.length === 0) return '계수를 1개 이상 추가해주세요.';
      if (!spec.coefficients.every((c) => isPositive(c.coefficient) && isPositive(c.velocity))) {
        return '계수·유속은 0보다 큰 값이어야 합니다.';
      }
      return undefined;
    case 'NOZZLE':
      if (spec.diameters.length === 0) return '직경을 1개 이상 추가해주세요.';
      if (!spec.diameters.every((d) => isPositive(d.diameter))) {
        return '직경은 0보다 큰 값이어야 합니다.';
      }
      return undefined;
    // 가스분석기는 사양이 없어 검증할 값도 없다.
    case 'GAS_ANALYZER':
      return undefined;
    default:
      return undefined;
  }
};

// 검사 주기는 서버도 nullable(미입력 시 예정일 계산 불가)이므로 값이 있을 때만 양수인지 본다.
export const validateInspectionForms = (inspections: InspectionItemForm[]): string | undefined => {
  const invalid = inspections.find(
    (item) => item.enabled && item.cycleMonths.trim() !== '' && !isPositive(item.cycleMonths)
  );
  return invalid ? '검사 주기는 0보다 큰 값이어야 합니다.' : undefined;
};

export const validateEquipmentFields = (form: EquipmentRegisterForm) => {
  const errors: Partial<Record<keyof EquipmentRegisterForm, string>> = {};

  if (!form.type) {
    errors.type = '장비 종류를 선택해주세요.';
  }

  if (!form.equipmentName.trim()) {
    errors.equipmentName = '장비명을 입력해주세요.';
  }

  if (form.type) {
    const specError = validateEquipmentSpec(form.type as EquipType, form.spec);
    if (specError) errors.spec = specError;
  }

  const inspectionError = validateInspectionForms(form.inspections);
  if (inspectionError) errors.inspections = inspectionError;

  return errors;
};
