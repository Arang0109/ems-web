import type { ScheduleCustomFieldRegisterForm } from "./types";

/** 서버 `CustomFieldDefinition.KEY_REGEX` 와 같다 — JEXL 이 `custom.key` 로 해석할 수 있는 ASCII 식별자. */
export const CUSTOM_FIELD_KEY_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
export const CUSTOM_FIELD_KEY_MAX_LENGTH = 50;
export const CUSTOM_FIELD_LABEL_MAX_LENGTH = 100;

/**
 * JEXL 이 Map 키보다 먼저 해석하는 이름(`empty`·`class`)과 예약어. 서버도 같은 집합을 거부하지만
 * 사용자가 저장 버튼을 누르기 전에 알려주는 쪽이 낫다.
 */
const RESERVED_KEYS = new Set([
  "class", "empty", "size",
  "eq", "ne", "lt", "gt", "le", "ge", "and", "or", "not", "null", "true", "false",
  "new", "var", "let", "const", "if", "else", "for", "while", "do", "return", "function",
]);

export const validateCustomFieldKey = (key: string): string | undefined => {
  const trimmed = key.trim();
  if (!trimmed) return "템플릿에서 쓸 키를 입력해주세요.";
  if (trimmed.length > CUSTOM_FIELD_KEY_MAX_LENGTH) return `키는 ${CUSTOM_FIELD_KEY_MAX_LENGTH}자 이하여야 합니다.`;
  if (!CUSTOM_FIELD_KEY_PATTERN.test(trimmed)) {
    return "키는 영문자·숫자·밑줄만 쓸 수 있고 영문자 또는 밑줄로 시작해야 합니다. (예: siteCode)";
  }
  if (RESERVED_KEYS.has(trimmed)) return `'${trimmed}' 은(는) 템플릿 문법의 예약어라 키로 쓸 수 없습니다.`;
  return undefined;
};

export const validateCustomFieldLabel = (label: string): string | undefined => {
  const trimmed = label.trim();
  if (!trimmed) return "화면에 보일 이름을 입력해주세요.";
  if (trimmed.length > CUSTOM_FIELD_LABEL_MAX_LENGTH) return `이름은 ${CUSTOM_FIELD_LABEL_MAX_LENGTH}자 이하여야 합니다.`;
  return undefined;
};

export const validateCustomFieldSortOrder = (sortOrder: string): string | undefined => {
  const trimmed = sortOrder.trim();
  if (trimmed && !/^\d+$/.test(trimmed)) return "표시 순서는 0 이상의 정수로 입력해주세요.";
  return undefined;
};

export const validateScheduleCustomFieldRegisterFields = (form: ScheduleCustomFieldRegisterForm) => {
  const errors: Partial<Record<keyof ScheduleCustomFieldRegisterForm, string>> = {};

  const keyError = validateCustomFieldKey(form.key);
  if (keyError) errors.key = keyError;
  const labelError = validateCustomFieldLabel(form.label);
  if (labelError) errors.label = labelError;
  const sortOrderError = validateCustomFieldSortOrder(form.sortOrder);
  if (sortOrderError) errors.sortOrder = sortOrderError;

  return errors;
};
