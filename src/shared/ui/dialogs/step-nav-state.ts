import type { DialogStep } from "./step-types";

/**
 * 활성 스텝 인덱스를 유효 범위로 가둔다.
 *
 * 조건부 스텝이 사라져 목록이 줄어들 때 `useEffect` 로 인덱스를 되돌리지 않고
 * 렌더 중 파생값으로 처리하기 위한 것이다 (prop→state 동기화 금지 규칙).
 * 목록이 비면 0 을 돌려준다.
 */
export const clampStepIndex = (index: number, length: number): number => {
  if (length <= 0) return 0;
  return Math.min(Math.max(index, 0), length - 1);
};

/**
 * 검증에 실패하는 첫 스텝의 인덱스. 전부 통과하면 `-1`.
 *
 * 마지막 스텝에서 제출할 때 앞 스텝의 누락을 놓치지 않도록 쓴다.
 * `validate` 가 없는 스텝은 통과로 본다.
 */
export const firstInvalidStepIndex = (steps: DialogStep[]): number =>
  steps.findIndex((step) => step.validate !== undefined && !step.validate());
