import { roundHalfUp } from "@shared/lib";

// 단위 변환 — 서버 스텝이 쓰는 환산식과 반올림 scale을 그대로 옮긴다.

// hPa → mmHg (PressureStep, scale 1)
export const convertHpaToMmHg = (value: number): number => roundHalfUp((value * 760) / 1013.25, 1);

// mmH₂O → mmHg. PressureStep은 scale 2, ParticleStep 내부 나눗셈은 scale 10을 쓴다.
export const convertMmH2OToMmHg = (value: number, scale = 2): number => roundHalfUp(value / 13.6, scale);

// mmH₂O → inchH₂O (표시 전용, 서버 미저장)
export const convertMmH2OToInchH2O = (value: number): number => roundHalfUp(value / 25.4, 1);

// °C → K (절대온도)
export const toKelvin = (celsius: number): number => celsius + 273;

// K → °C. 계산 컨텍스트는 K 로 들고 화면·기록지는 °C 로 보여준다. 없는 값은 없는 대로 둔다.
export const toCelsius = (kelvin: number | null | undefined): number | null =>
  kelvin == null ? null : kelvin - 273;

// 시간당 유량 → 분당 유량 (표시 전용, 서버 미저장). 없는 값은 `0` 이 아니라 `null` — 빈값 표기가 살아야 한다.
export const convertPerHourToPerMinute = (value: number | null | undefined): number | null =>
  value == null || Number.isNaN(value) ? null : value / 60;
