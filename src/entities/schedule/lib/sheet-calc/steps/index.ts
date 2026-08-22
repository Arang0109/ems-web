import type { SheetCalcStep } from "../context";
import { densityStep } from "./density-step";
import { exhaustGasStep } from "./exhaust-gas-step";
import { flowStep } from "./flow-step";
import { initStep } from "./init-step";
import { moistureStep } from "./moisture-step";
import { particleStep } from "./particle-step";
import { pressureStep } from "./pressure-step";
import { quantityStep } from "./quantity-step";

// 서버 계산 파이프라인(schedule/application/calculation)과 동일한 실행 순서.
// 뒤 스텝이 앞 스텝의 결과를 읽으므로 순서를 바꾸면 안 된다.
export const SHEET_CALC_STEPS: SheetCalcStep[] = [
  initStep,
  pressureStep,
  moistureStep,
  exhaustGasStep,
  densityStep,
  flowStep,
  quantityStep,
  particleStep,
];

export { calcRequiredPointCount } from "./init-step";
