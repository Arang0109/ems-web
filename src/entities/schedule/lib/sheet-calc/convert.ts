import { roundHalfUp } from "./math";

// 단위 변환 — 서버 스텝이 쓰는 환산식과 반올림 scale을 그대로 옮긴다.

// hPa → mmHg (PressureStep, scale 1)
export const convertHpaToMmHg = (value: number): number => roundHalfUp((value * 760) / 1013.25, 1);

// mmH₂O → mmHg. PressureStep은 scale 2, ParticleStep 내부 나눗셈은 scale 10을 쓴다.
export const convertMmH2OToMmHg = (value: number, scale = 2): number => roundHalfUp(value / 13.6, scale);

// mmH₂O → inchH₂O (표시 전용, 서버 미저장)
export const convertMmH2OToInchH2O = (value: number): number => roundHalfUp(value / 25.4, 1);

// °C → K (절대온도)
export const toKelvin = (celsius: number): number => celsius + 273;
