import { describe, expect, it } from "vitest";

import { calcWallDistances, getSectionRadiusCm } from "./wall-distances";
import type { StackSection } from "./wall-distances";

const circular = (diameter: number | null): StackSection => ({
  shape: "CIRCULAR",
  horizontalLength: diameter,
  verticalLength: null,
});

const rectangular = (horizontal: number | null, vertical: number | null): StackSection => ({
  shape: "RECTANGULAR",
  horizontalLength: horizontal,
  verticalLength: vertical,
});

describe("getSectionRadiusCm", () => {
  it("원형은 지름의 절반을 cm 로 돌려준다", () => {
    expect(getSectionRadiusCm(circular(2))).toBe(100);
  });

  it("사각형은 세로의 절반을 cm 로 돌려준다", () => {
    expect(getSectionRadiusCm(rectangular(3, 2))).toBe(100);
  });

  it("기준 치수가 없으면 null", () => {
    expect(getSectionRadiusCm(circular(null))).toBeNull();
    expect(getSectionRadiusCm(rectangular(3, null))).toBeNull();
  });
});

describe("calcWallDistances", () => {
  it("원형 2지점은 등면적 분할 위치를 돌려준다", () => {
    const [first, second] = calcWallDistances(circular(2), 2);
    // r=100cm, r·(1 − 계수). 규정 표 계수 0.500 / 0.866
    expect(first).toBeCloseTo(50, 10);
    expect(second).toBeCloseTo(13.4, 10);
  });

  it("원형 1지점은 중심선보다 벽 쪽에 놓인다", () => {
    const [only] = calcWallDistances(circular(2), 1);
    // r=100cm, 규정 표 계수 0.707
    expect(only).toBeCloseTo(29.3, 10);
    expect(only).toBeLessThan(100);
  });

  it("원형 측정점은 지점 번호가 커질수록 벽에 가까워진다", () => {
    const distances = calcWallDistances(circular(4), 5);
    expect(distances).toHaveLength(5);
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeLessThan(distances[i - 1]);
    }
    // 모든 지점이 단면 안(0 ~ 반경)에 놓인다
    distances.forEach((d) => {
      expect(d).toBeGreaterThan(0);
      expect(d).toBeLessThan(200);
    });
  });

  it("사각형은 측정점 수와 무관하게 중앙 1점", () => {
    expect(calcWallDistances(rectangular(3, 2), 3)).toEqual([100]);
  });

  it("치수가 없으면 빈 배열", () => {
    expect(calcWallDistances(circular(null), 3)).toEqual([]);
  });

  it("측정점이 없으면 빈 배열", () => {
    expect(calcWallDistances(circular(2), 0)).toEqual([]);
  });

  // 공정시험기준 "굴뚝중심에서 측정점까지의 거리" 표 — 계수는 소수 3자리
  const REGULATION_RATIOS: number[][] = [
    [0.707],
    [0.5, 0.866],
    [0.408, 0.707, 0.913],
    [0.354, 0.612, 0.791, 0.935],
    [0.316, 0.548, 0.707, 0.837, 0.949],
  ];

  it.each(REGULATION_RATIOS.map((ratios, idx) => [idx + 1, ratios] as const))(
    "%i지점 계수가 공정시험기준 표와 일치한다",
    (pointCount, ratios) => {
      const r = 100;
      const distances = calcWallDistances(circular(2), pointCount);
      expect(distances).toHaveLength(pointCount);
      distances.forEach((d, idx) => {
        expect(1 - d / r).toBeCloseTo(ratios[idx], 10);
      });
    },
  );

  it("지름 1.5m 2지점의 2번째 값은 표시 반올림 경계에서 10.1 이 된다", () => {
    // r=75cm. 75·(1 − 0.866) = 10.05 → toFixed(1) = "10.1"
    const distances = calcWallDistances(circular(1.5), 2);
    expect(distances[0]).toBeCloseTo(37.5, 10);
    expect(distances[1]).toBeCloseTo(10.05, 10);
    expect(distances[1].toFixed(1)).toBe("10.1");
  });
});
