import type { Shape } from "@shared/model";

// 굴뚝 단면의 측정점 위치 계산. 기록지의 "연도 벽면으로부터(cm)" 행과 단면 도형이 같은 값을 쓴다.

export type StackSection = {
  shape: Shape;
  horizontalLength: number | null;   // 원형=지름, 사각형=가로 (m)
  verticalLength: number | null;     // 사각형=세로 (m)
};

/** 공정시험기준 표의 계수(0.707·0.866·0.913 …)는 소수 3자리 반올림값이다. */
const RATIO_SCALE = 1000;

/** 등면적 분할 계수 √((2i−1)/2n) — 규정 표와 같은 소수 3자리로 맞춘다. */
const getPointRatio = (index: number, pointCount: number): number =>
  Math.round(Math.sqrt((2 * index - 1) / (2 * pointCount)) * RATIO_SCALE) / RATIO_SCALE;

/** 단면 반경(cm). 원형은 지름/2, 사각형은 세로/2 — 벽면거리·도형 스케일의 기준값이다. */
export const getSectionRadiusCm = (section: StackSection): number | null => {
  const d = section.shape === "CIRCULAR" ? section.horizontalLength : section.verticalLength;
  return d == null ? null : (d / 2) * 100;
};

/**
 * 벽면으로부터의 측정점 거리(cm).
 * 원형은 등면적 분할 `r·(1 − √((2i−1)/2n))`, 사각형은 중앙 1점.
 * 치수 미입력이면 빈 배열.
 */
export const calcWallDistances = (section: StackSection, pointCount: number): number[] => {
  const r = getSectionRadiusCm(section);
  if (r == null) return [];

  if (section.shape !== "CIRCULAR") return [r];
  if (pointCount <= 0) return [];

  // `r − r·ratio` 가 아니라 `r·(1 − ratio)` — 곱셈을 한 번만 해야 부동소수점 오차가
  // 표시 단계 반올림 경계를 넘기지 않는다 (75 − 75·0.866 = 10.049999…, 75·0.134 = 10.05).
  return Array.from({ length: pointCount }, (_, idx) =>
    r * (1 - getPointRatio(idx + 1, pointCount)),
  );
};
