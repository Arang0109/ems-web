// 서버 Calculator 미러링 — 반올림·집계 순수 유틸.
// 도메인 지식이 없는 수치 연산만 담는다(공식은 formula.ts, 단위변환은 convert.ts).

// BigDecimal HALF_UP(부호 무관 반올림, .5는 절대값 증가)과 동일. fp 표현오차는 미세 nudge로 흡수.
export const roundHalfUp = (value: number, scale: number): number => {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** scale;
  const scaled = Math.abs(value) * factor;
  const rounded = Math.round(scaled + 1e-9);
  return (value < 0 ? -rounded : rounded) / factor;
};

// null은 0으로 취급해 평균(scale HALF_UP). 비어 있으면 0. (Calculator.averageTreatNullAsZero)
export const averageTreatNullAsZero = (
  values: (number | null | undefined)[] | null | undefined,
  scale: number,
): number => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce<number>((acc, v) => acc + (v == null ? 0 : v), 0);
  return roundHalfUp(sum / values.length, scale);
};

// null 제외 평균 — ParticleStep 집계용. 비어 있으면 null.
export const averageOrNull = (values: number[], scale: number): number | null => {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return roundHalfUp(sum / values.length, scale);
};

export const sumOrNull = (values: number[], scale: number): number | null => {
  if (values.length === 0) return null;
  return roundHalfUp(values.reduce((acc, v) => acc + v, 0), scale);
};

export const isEmpty = (values: number[] | null | undefined): boolean => !values || values.length === 0;

// null 을 걸러낸 숫자 배열 — 집계 입력 정리용
export const compactNumbers = (values: (number | null | undefined)[]): number[] =>
  values.filter((v): v is number => v != null);
