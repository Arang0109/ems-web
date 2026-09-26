import { roundHalfUp, toNumberOrNull } from "@shared/lib";

/**
 * 표시 전용 입력값 평균 — 입력된 값만 세고, 비어 있으면 `null`.
 *
 * 계산 미리보기가 평균을 주지 않는 항목(DGM 온도·진공압·최종 임핀저 온도)을 전치 표의 `평균` 열과
 * 기록지 평균행이 함께 그린다. 두 표현이 같은 판정을 쓰려고 한 곳에 둔다.
 * 서버가 계산하지 않는 값이라 저장되지 않으며, 자릿수는 표시 자리에 맞춘다.
 */
export const averageOfInputs = (values: string[], scale: number): number | null => {
  const nums = values.map(toNumberOrNull).filter((v): v is number => v !== null);
  if (nums.length === 0) return null;

  return roundHalfUp(nums.reduce((a, v) => a + v, 0) / nums.length, scale);
};
