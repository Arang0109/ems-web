import type { Orientation, Shape } from "@shared/model";

/**
 * 기록지의 "굴뚝단면 및 측정점 배열" 그림.
 *
 * 공정시험기준(ES 01114.b 2.4.1.2)상 유속 분포가 대칭이면 수평 굴뚝은 1/2 단면,
 * 수직 굴뚝은 1/4 단면을 취한다. 이 프로젝트는 유속이 일정하다고 보고 항상 이 축소를
 * 적용하므로 **수직은 오른편 반경에만, 수평은 좌우 양편에** 측정점을 찍는다.
 * 사각형 단면은 측정점을 중앙 한 곳으로 둔다.
 */

const VIEW = 100;              // viewBox 한 변
const CENTER = VIEW / 2;
const OUTER = 44;              // 단면 외곽 반경(원형) / 사각형 최대 반폭
const POINT_RADIUS = 2.4;

interface Props {
  shape: Shape;
  orientation: Orientation;
  /** 벽면으로부터의 측정점 거리(cm) — `calcWallDistances` 결과 */
  wallDistances: number[];
  /** 단면 반경(cm) — 거리→좌표 환산 기준. 치수 미입력이면 null */
  radiusCm: number | null;
  horizontalLength: number | null;   // 사각형 종횡비용 (m)
  verticalLength: number | null;
}

export const StackCrossSection = ({
  shape, orientation, wallDistances, radiusCm, horizontalLength, verticalLength,
}: Props) => {
  const isCircular = shape === "CIRCULAR";

  // 사각형 종횡비 — 치수가 없으면 정사각으로 그린다
  const ratio = !isCircular && horizontalLength != null && verticalLength != null && verticalLength > 0
    ? horizontalLength / verticalLength : 1;
  const halfWidth = ratio >= 1 ? OUTER : OUTER * ratio;
  const halfHeight = ratio >= 1 ? OUTER / ratio : OUTER;

  // 벽면거리(cm) → 중심으로부터의 x 오프셋(viewBox 단위)
  const offsets = isCircular && radiusCm != null && radiusCm > 0
    ? wallDistances.map((d) => (OUTER * (radiusCm - d)) / radiusCm)
    : [];

  // 수직은 오른편만, 수평은 좌우 양편
  const xs = isCircular
    ? offsets.flatMap((off) => orientation === "HORIZONTAL"
      ? [CENTER + off, CENTER - off]
      : [CENTER + off])
    : radiusCm != null ? [CENTER] : [];

  return (
    <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="mx-auto size-30" role="presentation">
      {isCircular ? (
        <circle cx={CENTER} cy={CENTER} r={OUTER}
          className="fill-none stroke-border" strokeWidth={1.5} />
      ) : (
        <rect x={CENTER - halfWidth} y={CENTER - halfHeight}
          width={halfWidth * 2} height={halfHeight * 2}
          className="fill-none stroke-border" strokeWidth={1.5} />
      )}

      {/* 측정선 — 측정공이 뚫리는 축 */}
      {isCircular && (
        <line x1={CENTER - OUTER} y1={CENTER} x2={CENTER + OUTER} y2={CENTER}
          className="stroke-border" strokeWidth={0.6} strokeDasharray="3 2" />
      )}

      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={CENTER} r={POINT_RADIUS} className="fill-foreground" />
      ))}
    </svg>
  );
};
