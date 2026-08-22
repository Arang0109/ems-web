import { roundHalfUp } from "./math";

// 서버 계산 스텝과 동일한 상수. 값이 바뀌면 서버 쪽도 함께 바뀌어야 한다.

export const K_FACTOR_CONST = 0.0000803989;   // 8.03989 × 10⁻⁵ (공정시험법 개정 시 변경)
export const DEFAULT_DELTA_H = 46;            // 오리피스 보정계수 △H@ 기본값
export const DEFAULT_CP = 0.84;               // 피토관 계수 기본값
export const ISO_CONST = 16670;               // 등속흡입계수 상수 1.667 × 10⁴
export const MOISTURE_RATIO = roundHalfUp(18 / 22.4, 10); // 서버 MOISTURE_RATIO(scale 10)

// 표준상태 기체 몰부피 (L/mol)
export const STANDARD_MOLAR_VOLUME = 22.4;
