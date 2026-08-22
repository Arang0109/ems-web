import type { MeasurementItemSnapshot } from "@entities/schedule";

import type { ExhaustGasForm } from "./types";

/**
 * 배출가스 정보 섹션의 조건부 필드 노출 규칙.
 *
 * 판정은 전역 카탈로그 code(`NOX` 등)로 한다 — 고객사가 `nameKr`/`nameEn` 을 자유롭게 바꿔도
 * 흔들리지 않는 유일한 키다. 다만 카탈로그 도입 이전에 만들어진 스냅샷과 카탈로그에 없는
 * 고객사 자체 물질은 code 가 null 이라, 그때만 아래 이름 별칭 테이블로 폴백한다.
 */

/** 배정 여부에 따라 입력칸 노출이 갈리는 오염물질 */
export type ExhaustGasPollutant = "thc" | "nox" | "sox";

/** 이 측정계획에 그 오염물질이 배정돼 있는가 */
export type AssignedPollutants = Record<ExhaustGasPollutant, boolean>;

/** 실제로 입력칸을 노출할 것인가 — 배정 여부와 기존 저장값을 합성한 결과 */
export type ExhaustGasVisibility = Record<ExhaustGasPollutant, boolean>;

/** 스냅샷을 아직 못 받았을 때의 기본값 */
export const NO_ASSIGNED_POLLUTANTS: AssignedPollutants = { thc: false, nox: false, sox: false };

/**
 * 오염물질별 표기 변형 목록. 전부 `normalize` 를 거친 형태로 적는다.
 *
 * 현장·원장 표기가 제각각이라(`NOx` / `질소산화물` / `Nitrogen Oxides` / `질소산화물(NOx)`)
 * 한 항목을 여러 이름으로 받아야 한다.
 */
const POLLUTANT_ALIASES: Record<ExhaustGasPollutant, ReadonlySet<string>> = {
  thc: new Set([
    "thc", "총탄화수소", "총탄화수소류", "탄화수소",
    "totalhydrocarbon", "totalhydrocarbons", "hydrocarbons",
  ]),
  nox: new Set([
    "nox", "질소산화물", "이산화질소", "일산화질소",
    "nitrogenoxide", "nitrogenoxides", "no2",
  ]),
  sox: new Set([
    "sox", "황산화물", "이산화황", "아황산가스",
    "sulfuroxide", "sulfuroxides", "so2",
  ]),
};

/** 대소문자·공백·구분기호를 지운 비교용 표현 */
const normalize = (value: string): string => value.toLowerCase().replace(/[\s\-_()]/g, "");

/** 이름을 낱말 단위로 쪼갠 비교용 표현 — `"질소산화물(NOx)"` → `["질소산화물", "nox"]` */
const tokenize = (value: string): string[] =>
  value.split(/[\s\-_()[\]/,·]+/).map(normalize).filter(Boolean);

/**
 * 이름 하나가 그 오염물질을 가리키는가.
 *
 * **부분일치(`includes`)를 쓰면 안 된다.** `"Carbon Monoxide"` → `"carbonmonoxide"` 안에
 * `"nox"`(mo**nox**ide)가 들어 있어 일산화탄소가 NOx 로 잡힌다. 그렇다고 완전일치만 쓰면
 * `"질소산화물(NOx)"` 같은 병기 표기를 놓치므로, 통짜 비교와 낱말 비교를 함께 쓴다.
 */
const matches = (name: string | null | undefined, pollutant: ExhaustGasPollutant): boolean => {
  if (!name) return false;

  const aliases = POLLUTANT_ALIASES[pollutant];
  return aliases.has(normalize(name)) || tokenize(name).some((token) => aliases.has(token));
};

/**
 * 판정의 1순위 기준인 전역 카탈로그 code. 이름과 달리 고객사가 바꿀 수 없다.
 * 카탈로그 도입 이전 스냅샷과 고객사 자체 물질은 code 가 없어 이름 별칭으로 폴백한다.
 */
const POLLUTANT_CODES: Record<ExhaustGasPollutant, string> = {
  thc: "THC",
  nox: "NOX",
  sox: "SOX",
};

/** 측정계획 스냅샷의 측정항목 목록에서 THC·NOx·SOx 배정 여부를 판정한다. */
export const getAssignedPollutants = (
  items: MeasurementItemSnapshot[] | undefined,
): AssignedPollutants => {
  if (!items || items.length === 0) return NO_ASSIGNED_POLLUTANTS;

  // code 가 있으면 그것만 믿는다 — code 를 가진 항목까지 이름으로 재판정하면,
  // 고객사가 표기명을 바꿔 둔 물질이 엉뚱한 칸을 열 수 있다.
  const isAssigned = (pollutant: ExhaustGasPollutant): boolean =>
    items.some((item) => (
      item.code
        ? item.code === POLLUTANT_CODES[pollutant]
        : matches(item.nameKr, pollutant) || matches(item.nameEn, pollutant)
    ));

  return { thc: isAssigned("thc"), nox: isAssigned("nox"), sox: isAssigned("sox") };
};

/** 그 오염물질의 입력값이 폼에 하나라도 들어 있는가 */
export const hasSavedExhaustGasValue = (
  exhaustGas: ExhaustGasForm,
  pollutant: ExhaustGasPollutant,
): boolean => {
  const isFilled = (value: string): boolean => value.trim() !== "";

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
  assigned: AssignedPollutants,
  hadSavedValue: ExhaustGasVisibility,
): ExhaustGasVisibility => ({
  thc: assigned.thc || hadSavedValue.thc,
  nox: assigned.nox || hadSavedValue.nox,
  sox: assigned.sox || hadSavedValue.sox,
});
