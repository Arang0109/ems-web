import type { NozzleRecommendation } from "@entities/schedule";
import { cn } from "@/lib/utils";
import { HelpTip } from "@shared/ui/tooltip";

import { PARTICLE_HINT } from "../../../model/field-hints";
import { display } from "./point-results";

/** 채취시간 옆에 세우는 노즐 기준 — 세 값이 늘 함께 읽히므로 한 덩이로 넘긴다 */
export interface NozzleBasis {
  /** 선택된 노즐경(폼 값). 빈 문자열이면 아직 고르지 않았다 */
  size: string;
  /** 선택한 노즐의 산정 예상치 — 계산값 드로어의 `노즐 산정` 과 같은 목록에서 온다 */
  estimate: NozzleRecommendation | null;
  /** 예상치의 기준이 된 희망 흡입량 (Sm³) */
  targetVolume: string;
  /** 기록지의 측정점 수 — 산정치(전체 합)를 지점 당 목표치로 나누는 분모다 */
  pointCount: number;
}

interface Props {
  basis: NozzleBasis;
  className?: string;
}

/**
 * 산정치를 측정점 수로 균등 배분한 지점 당 목표치.
 *
 * 노즐 산정의 `samplingTime`·`Vm` 은 측정 전체의 값이고, 기록지가 합산하는
 * `totalSamplingTime`·`totalVm` 도 지점별 값의 합이다. 그러니 지점 입력칸에 적어 넣을
 * 목표치는 산정치 ÷ 측정점 수이고, 그 값을 모든 지점에 넣으면 합계가 산정치와 맞는다.
 * 자리수는 원값과 같게 둔다 — 나눗셈으로 없던 정밀도를 만들지 않는다.
 */
const perPoint = (
  total: number | null | undefined,
  count: number,
  scale: number,
): number | null => {
  if (total == null || count <= 0) return null;

  const factor = 10 ** scale;
  return Math.round((total / count) * factor) / factor;
};

/**
 * 채취시간 입력 아래에 붙는 **목표치 한 줄** — 고른 노즐과 그 노즐의 예상 채취시간·채취량.
 *
 * 채취량이 제대로 잡혔는지는 "이 노즐로 이만큼 돌리면 이만큼 나온다" 와 대조해야 알 수 있는데,
 * 그 예상치는 계산값 드로어의 `노즐 산정` 탭에 있다. 채취량을 적어 넣는 손과 기준을 보는 눈이
 * 다른 표면에 있으면 대조가 되지 않으므로 예상치 한 줄만 입력 옆으로 끌어온다 —
 * 나머지 산정 화면(추천 목록·차압 범위·희망 흡입량)은 그대로 드로어가 소유한다.
 *
 * **지점별 값이 아니다.** 산정은 측정점 평균 조건 기준이라 어느 지점에서 보든 같은 값이다.
 * 지점 당 목표치도 전체 산정치를 측정점 수로 고르게 나눈 값이라 모든 지점에서 같다.
 * 지점별 실측 결과(오리피스차압·등속흡입계수)는 이 아래 `자동계산 데이터` 가 따로 그린다.
 */
export const NozzleBasisNote = ({ basis, className }: Props) => (
  <div className={cn("rounded-nav bg-canvas py-2 text-label text-ink-soft", className)}>
    {basis.size === "" ? (
      <span className="text-muted-ink">
        계산값 · 노즐 산정에서 노즐을 고르면 예상 채취시간·채취량이 표시됩니다.
      </span>
    ) : (
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          노즐 직경 :{" "}
          <span className="text-body-4 text-primary">{basis.size} cm</span>
          <HelpTip
            content={PARTICLE_HINT.estimatedSamplingTime}
            label="예상 채취시간 설명"
            className="items-center"
          />
        </div>

        <div>
          채취 시간 :{" "}
          <span className="text-body-4 text-primary">
            {display(basis.estimate?.samplingTime)}
          </span>{" "}
          분 이상, 지점 당{" "}
          <span className="text-body-4 text-primary">
            {display(perPoint(basis.estimate?.samplingTime, basis.pointCount, 1))}
          </span>{" "}
          분 이상
        </div>

        <div className="text-muted-ink">
          · 희망 흡입량 {basis.targetVolume || "-"} Sm³ 기준 (사용자 입력값)
        </div>

        <div>
          실제 채취량 :{" "}
          <span className="text-body-4 text-primary">
            {display(basis.estimate?.Vm)}
          </span>{" "}
          m³
        </div>

        <div>
          측정 지점 당 약{" "}
          <span className="text-body-4 text-primary">
            {display(perPoint(basis.estimate?.Vm, basis.pointCount, 5))}
          </span>{" "}
          m³
        </div>
      </div>
    )}
  </div>
);
