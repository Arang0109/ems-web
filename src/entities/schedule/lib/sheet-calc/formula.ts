import { DEFAULT_CP } from "./constants";
import { roundHalfUp } from "./math";
import type { PitotCoefficient } from "./types";

// 여러 스텝이 공유하는 순수 공식.

// FlowStep — 임시 유속을 속도구간에 매칭해 피토관 계수 조회(없으면 기본 0.84)
export const findPitotCoefficient = (coefficients: PitotCoefficient[], velocity: number): number => {
  let result = DEFAULT_CP;
  for (const pc of coefficients) {
    if (pc.velocity != null && velocity >= pc.velocity) result = pc.coefficient;
  }
  return result;
};

// Flow/Quantity/ParticleStep — Vs = Cp × √(19.62 × Pv / gasDensity). 반올림 전 원시값.
export const gasVelocityRaw = (cp: number, pv: number, gasDensity: number): number | null => {
  if (gasDensity <= 0) return null;
  const value = roundHalfUp((19.62 * pv) / gasDensity, 5);
  if (value < 0) return null;
  return cp * Math.sqrt(value);
};

// 원 단면적 π·d²/4 — 내부 나눗셈 scale이 스텝마다 다르다(Init 5, Particle 10).
const circleArea = (diameter: number, innerScale: number): number =>
  roundHalfUp(roundHalfUp((3.14 * diameter * diameter) / 4, innerScale), 3);

// InitStep — 원형 굴뚝 단면적 (m²)
export const stackCircleArea = (diameter: number): number => circleArea(diameter, 5);

// ParticleStep — 노즐 단면적 An (cm²)
export const nozzleArea = (nozzleSize: number): number => circleArea(nozzleSize, 10);
