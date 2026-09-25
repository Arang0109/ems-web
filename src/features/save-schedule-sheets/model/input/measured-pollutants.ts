import type { ExhaustGasPollutant } from "@entities/schedule";

import type { ExhaustGasForm } from "../types";
import { isFilled } from "./required-fields";

/**
 * 배출가스 정보 섹션의 조건부 필드 노출 규칙.
 *
 * 어느 항목이 THC·NOx·SOx 인가(code 우선·이름 별칭 폴백)는 성적서 탭의 기록지 값 가져오기도 쓰므로
 * entities/schedule/lib 에 있다. 이 슬라이스 안의 소비처가 여기서 가져가던 이름을 그대로 유지한다.
 */
export type { ExhaustGasPollutant, AssignedPollutants } from "@entities/schedule";
export { NO_ASSIGNED_POLLUTANTS, getAssignedPollutants } from "@entities/schedule";

/** 실제로 입력칸을 노출할 것인가 — 배정 여부와 기존 저장값을 합성한 결과 */
export type ExhaustGasVisibility = Record<ExhaustGasPollutant, boolean>;

/** 그 오염물질의 입력값이 폼에 하나라도 들어 있는가 */
export const hasSavedExhaustGasValue = (
  exhaustGas: ExhaustGasForm,
  pollutant: ExhaustGasPollutant,
): boolean => {
  if (pollutant === "thc") return isFilled(exhaustGas.thcAnalyzerStartTime);
  return exhaustGas[pollutant].some(isFilled);
};

/**
 * 실제 노출 여부 — 배정됐거나, 배정되지 않았어도 이미 입력된 값이 있으면 보여준다.
 *
 * 후자가 없으면 측정항목 구성이 바뀌거나 이름 매칭이 빗나갔을 때 입력해 둔 데이터가
 * 화면에서 사라진 것처럼 보인다.
 */
export const getExhaustGasVisibility = (
  assigned: Record<ExhaustGasPollutant, boolean>,
  hadSavedValue: ExhaustGasVisibility,
): ExhaustGasVisibility => ({
  thc: assigned.thc || hadSavedValue.thc,
  nox: assigned.nox || hadSavedValue.nox,
  sox: assigned.sox || hadSavedValue.sox,
});
