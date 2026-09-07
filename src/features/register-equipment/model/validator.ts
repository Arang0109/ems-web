import type { EquipmentRegisterForm, EquipmentSpecForm, InspectionItemForm } from "./types";
import type { EquipmentStepId } from "./step-progress";
import type { EquipType } from "@shared/model";
import { EQUIP_SPEC_FIELD_LABEL } from "@shared/config";

type EquipmentErrors = Partial<Record<keyof EquipmentRegisterForm, string>>;

export const isPositive = (v: string) => v.trim() !== '' && Number(v) > 0;
export const isNonNegative = (v: string) => v.trim() !== '' && Number(v) >= 0;

// 유형별 spec 검증 — 문제가 있으면 spec 레벨 메시지를 반환한다.
export const validateEquipmentSpec = (type: EquipType, spec: EquipmentSpecForm): string | undefined => {
  switch (type) {
    case 'PARTICLE_SAMPLER':
      if (![spec.totalVolume, spec.orificeDp, spec.yd].every(isNonNegative)) {
        return `${EQUIP_SPEC_FIELD_LABEL.totalVolume}·${EQUIP_SPEC_FIELD_LABEL.orificeDp}·${EQUIP_SPEC_FIELD_LABEL.yd} 값을 모두 입력해주세요.`;
      }
      return undefined;
    case 'GAS_SAMPLER':
    case 'OTHER':
      if (!isNonNegative(spec.totalVolume)) return `${EQUIP_SPEC_FIELD_LABEL.totalVolume} 값을 입력해주세요.`;
      return undefined;
    case 'PITOT_TUBE':
      if (!spec.pitotTubeType) return `${EQUIP_SPEC_FIELD_LABEL.pitotTubeType}를 선택해주세요.`;
      if (spec.coefficients.length === 0) return `${EQUIP_SPEC_FIELD_LABEL.coefficient}를 1개 이상 추가해주세요.`;
      if (!spec.coefficients.every((c) => isPositive(c.coefficient) && isPositive(c.velocity))) {
        return `${EQUIP_SPEC_FIELD_LABEL.coefficient}·${EQUIP_SPEC_FIELD_LABEL.velocity}은 0보다 큰 값이어야 합니다.`;
      }
      return undefined;
    case 'NOZZLE':
      if (spec.diameters.length === 0) return `${EQUIP_SPEC_FIELD_LABEL.diameter}을 1개 이상 추가해주세요.`;
      if (!spec.diameters.every((d) => isPositive(d.diameter))) {
        return `${EQUIP_SPEC_FIELD_LABEL.diameter}은 0보다 큰 값이어야 합니다.`;
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

// --- 스텝별 검증 --------------------------------------------------------
// 위저드의 '다음' 이 현재 스텝만 검증하는 데 쓴다. 각각 부분 에러맵을 반환한다.

export const validateBasicStep = (form: EquipmentRegisterForm): EquipmentErrors => {
  const errors: EquipmentErrors = {};

  if (!form.type) {
    errors.type = '장비 종류를 선택해주세요.';
  }

  if (!form.equipmentName.trim()) {
    errors.equipmentName = '장비명을 입력해주세요.';
  }

  return errors;
};

// 구매 정보는 현재 전부 선택 입력이다. 규칙이 생길 자리를 비워 둔다.
export const validatePurchaseStep = (): EquipmentErrors => ({});

export const validateInspectionStep = (form: EquipmentRegisterForm): EquipmentErrors => {
  const error = validateInspectionForms(form.inspections);
  return error ? { inspections: error } : {};
};

export const validateSpecStep = (form: EquipmentRegisterForm): EquipmentErrors => {
  // 종류를 고르기 전에는 검증할 사양이 없다 (누락은 기본 정보 스텝이 잡는다).
  if (!form.type) return {};

  const error = validateEquipmentSpec(form.type, form.spec);
  return error ? { spec: error } : {};
};

export const STEP_VALIDATORS: Record<EquipmentStepId, (form: EquipmentRegisterForm) => EquipmentErrors> = {
  basic: validateBasicStep,
  purchase: validatePurchaseStep,
  inspection: validateInspectionStep,
  spec: validateSpecStep,
};

/**
 * 제출 시 전체 검증.
 *
 * **스텝 검증 함수들의 합집합이어야 한다** — 마지막 스텝에서 제출할 때 앞 스텝의 누락을
 * 놓치지 않기 위함이다. 여기에만 규칙을 추가하면 '다음' 이 통과시켜 버린다.
 */
export const validateEquipmentFields = (form: EquipmentRegisterForm): EquipmentErrors =>
  Object.values(STEP_VALIDATORS).reduce(
    (errors, validate) => ({ ...errors, ...validate(form) }),
    {} as EquipmentErrors,
  );
