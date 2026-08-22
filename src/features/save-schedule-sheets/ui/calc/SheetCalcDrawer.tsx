import { useState } from "react";

import type { NozzleRecommendation, SheetCalcPreview } from "@entities/schedule";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@shared/model";
import { Drawer } from "@shared/ui/drawer";
import { CalcResultGrid, InputGroup, UnitField } from "@shared/ui/form";
import { Tabs } from "@shared/ui/tabs";

import { PARTICLE_HINT } from "../../model/field-hints";
import type { ExhaustGasVisibility } from "../../model/measured-pollutants";
import type { ParticleForm, SamplingPointForm } from "../../model/types";
import { exhaustGasAvgItems } from "../sections/exhaust-gas-rows";
import { buildPointGroups, pointAverageItems } from "../sections/sampling-point/point-results";
import { environmentItems, flowItems, nozzleEstimateItems } from "./calc-groups";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  isParticle: boolean;
  particle: ParticleForm;
  /** 지점별 입력 — 측정지점 평균의 입력값 평균을 여기서 낸다 */
  points: SamplingPointForm[];
  preview: SheetCalcPreview | null;
  /** 기준산소농도 (측정시설 원장) — 산소보정계수와 함께 읽는다 */
  standardOxygen: number | null;
  /** 배출가스 평균 묶음에 세울 성분 — 입력 회차와 같은 판정을 쓴다 */
  visiblePollutants: ExhaustGasVisibility;

  nozzleOptions: { value: string; label: string }[];
  /** 노즐경 후보별 추정치 — 추천 목록과 산정 예상치가 같은 목록을 본다 */
  recommendations: NozzleRecommendation[];
  /** 현재 선택된 노즐경의 산정 결과 */
  nozzleEstimate: NozzleRecommendation | null;
  targetVolume: string;
  onTargetVolumeChange: (value: string) => void;

  editable: boolean;
  onParticleChange: (patch: Partial<ParticleForm>) => void;
}

const display = (v: number | null): string => (v == null ? "-" : String(v));

/**
 * 기록지 한 장의 계산 결과를 모아 보는 가장자리 표면. 액션 바의 `계산값` 이 입구다.
 *
 * **입력과 계산 결과를 표면으로 가르는 것이 목적이다.** 섹션 폼에는 현장에서 적어 넣는 값과
 * 그 입력에 딸린 파생값 한 줄(`CalcResultRow`)만 남고, 독립된 결과 묶음은 전부 이쪽에 모인다.
 * 흩어져 있으면 "수분량이 이만큼인데 표준유량이 이게 맞나" 같은 대조를 섹션을 오가며 해야 한다.
 *
 * 입자상 기록지는 **탭 둘**로 나뉜다 — 읽기만 하는 `계산값` 과, 고르고 바로 결과를 보는
 * `노즐 산정`. 한 화면에 세로로 쌓으면 노즐을 고른 뒤 예상치를 보려고 스크롤을 오가게 된다.
 * 노즐 선택이 이 드로어에 있는 이유는 **무엇을 고를지가 계산 결과에서 나오기** 때문이고,
 * 그래서 추천 후보를 눌러도 드로어를 닫지 않는다 — 같은 탭 아래 예상치가 그 자리에서 갱신된다.
 *
 * `계산값` 이 첫 탭인 것은 입구 버튼의 이름과 맞추기 위해서다. 가스상 기록지는 노즐이 없어
 * 탭 없이 `계산값` 만 그리는데, 그때도 처음 보이는 화면이 같아진다.
 *
 * 읽기 전용(`editable=false`)이어도 열린다. 입력만 잠기고 계산 결과는 그대로 읽힌다.
 */
export const SheetCalcDrawer = ({
  open, onOpenChange, isParticle, particle, points, preview, standardOxygen, visiblePollutants,
  nozzleOptions, recommendations, nozzleEstimate, targetVolume, onTargetVolumeChange,
  editable, onParticleChange,
}: Props) => {
  const isMobile = useIsMobile();

  // 탭을 오가도 유지된다 — 이 상태는 탭 본문이 아니라 드로어가 소유한다.
  const [minDp, setMinDp] = useState(10);
  const [maxDp, setMaxDp] = useState(40);

  // 오리피스차압이 허용범위 안에 드는 후보만 추천 목록에 노출한다.
  const filtered = recommendations.filter(
    (r) => r.orificeDp != null && r.orificeDp >= minDp && r.orificeDp <= maxDp,
  );

  const hasNozzles = recommendations.length > 0;
  const calcReady = recommendations.some((r) => r.orificeDp != null);

  const calcContent = (
    <div className="space-y-3">
      <CalcResultGrid
        title="1. 기상 · 수분량"
        columns={4}
        emptyText="대기압과 수분량 측정값을 입력하면 환산값이 표시됩니다."
        items={environmentItems(preview)}
      />

      <CalcResultGrid
        title="2. 배출가스"
        columns={4}
        emptyText="1~3회 측정값을 입력하면 성분별 평균과 산소보정계수가 계산됩니다."
        items={exhaustGasAvgItems(preview?.exhaustGas ?? null, standardOxygen, visiblePollutants)}
      />

      <CalcResultGrid
        title="3. 유량"
        columns={2}
        emptyText="지점별 측정값을 입력하면 유속·유량이 계산됩니다."
        items={flowItems(preview)}
      />

      {/* 측정점 섹션에서 떼어 온 묶음 — 고른 노즐이 실제 등속흡입계수에 어떻게 닿았는지도 여기서 본다.
          지점별 값은 측정점 카드·표가 이미 그리므로 여기서는 평균만 본다. */}
      {buildPointGroups(isParticle, preview).map((group) => (
        <CalcResultGrid
          key={group.label}
          title={`4. 측정지점 평균 · ${group.label}`}
          columns={2}
          emptyText="지점별 측정값을 입력하면 항목별 평균이 계산됩니다."
          items={pointAverageItems(group, points, preview)}
        />
      ))}
    </div>
  );

  const nozzleContent = (
    <div className="space-y-4">
      {/* 옵션 라벨이 이미 "3 cm" 형태라 단위 박스를 따로 두지 않는다. */}
      <UnitField
        label="노즐 사이즈 (cm)" required options={nozzleOptions} placeholder="노즐 선택"
        hint={PARTICLE_HINT.nozzleSize}
        value={particle.nozzleSize} disabled={!editable}
        onChange={(v) => onParticleChange({ nozzleSize: v })}
      />

      <CalcResultGrid
        title={
          <>
            노즐 산정 예상치
            <span className="text-body-3"> · 희망 흡입량 {targetVolume || "-"} m³ 기준</span>
          </>
        }
        emptyText="노즐을 선택하면 예상 오리피스차압·채취시간·채취량이 표시됩니다."
        items={nozzleEstimateItems(nozzleEstimate)}
      />

      <section className="space-y-3 rounded-nav bg-canvas p-3">
        <p className="text-label text-muted-ink">적정 노즐사이즈 산정</p>

        <InputGroup
          label="표준상태로 환산한 채취량 (Sm³)"
          type="number"
          value={targetVolume}
          min={0}
          step={0.1}
          onChange={onTargetVolumeChange}
        />

        <div className="space-y-2">
          <p className="text-body-4">오리피스 차압 범위 (mmH₂O)</p>
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-ink w-14">최소 {minDp}</span>
            <input
              type="range" min={0} max={60} value={minDp}
              onChange={(e) => setMinDp(Math.min(Number(e.target.value), maxDp))}
              className="flex-1 accent-brand-primary"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-caption text-muted-ink w-14">최대 {maxDp}</span>
            <input
              type="range" min={0} max={60} value={maxDp}
              onChange={(e) => setMaxDp(Math.max(Number(e.target.value), minDp))}
              className="flex-1 accent-brand-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-body-4">노즐 추천 목록 ({filtered.length}건)</p>

          {!hasNozzles && (
            <p className="text-body-2 text-muted-ink py-2">
              배정된 노즐 장비의 노즐경 정보가 없습니다. 측정장비 탭에서 노즐을 배정해주세요.
            </p>
          )}
          {hasNozzles && !calcReady && (
            <p className="text-body-2 text-muted-ink py-2">
              계산에 필요한 입력(대기압·수분량·배출가스 농도·측정점 온도/동압)이 부족합니다.
            </p>
          )}
          {hasNozzles && calcReady && filtered.length === 0 && (
            <p className="text-body-2 text-muted-ink py-2">
              범위에 맞는 노즐이 없습니다. 차압 범위를 조정해주세요.
            </p>
          )}

          {filtered.map((r) => {
            const isSelected = String(r.nozzleSize) === particle.nozzleSize;

            return (
              <button
                key={r.nozzleSize}
                type="button"
                // 고른 뒤에도 닫지 않는다 — 같은 탭 위쪽 예상치가 갱신되는 것을 보여주는 게 목적이다.
                onClick={() => onParticleChange({ nozzleSize: String(r.nozzleSize) })}
                disabled={!editable}
                // 바텀시트에서 엄지로 누르는 타깃이라 최소 높이를 44px 로 잡는다.
                className={cn(
                  "flex min-h-11 w-full flex-col justify-center rounded-nav border bg-surface p-3 text-left",
                  "transition-colors motion-reduce:transition-none",
                  "disabled:pointer-events-none disabled:opacity-60",
                  "hover:border-brand-primary hover:bg-brand-soft/60",
                  isSelected ? "border-brand-primary bg-brand-soft" : "border-rule",
                )}
              >
                <p className="text-body-4">
                  노즐직경 {r.nozzleSize} cm
                  {isSelected && <span className="text-caption text-brand-dark"> · 적용 중</span>}
                </p>
                <p className="text-caption text-muted-ink mt-1">
                  오리피스차압 {display(r.orificeDp)} mmH₂O · 채취시간 {display(r.samplingTime)} 분 · 채취량 {display(r.Vm)} m³
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );

  return (
    <Drawer
      title="측정값 계산 결과"
      description={
        isParticle
          ? "입력한 값에서 산출된 계산 결과와 노즐 산정입니다."
          : "입력한 값에서 산출된 계산 결과입니다."
      }
      open={open}
      onOpenChange={onOpenChange}
      side={isMobile ? "bottom" : "right"}
      // 결과 묶음이 많아 기본 폭(md)으로는 2열이 눌린다. 그리드도 전부 2열로 고정한다 —
      // `CalcResultGrid` 의 `columns` 는 뷰포트 기준(`md:`)이라 좁은 드로어 안에서도 4열이 잡힌다.
      className="sm:max-w-xl"
    >
      {isParticle ? (
        // 드로어가 이미 표면이므로 탭 본문에 카드 셸을 씌우지 않는다.
        <Tabs
          contentPanel={false}
          options={[
            { value: "nozzle", label: "노즐 산정", content: nozzleContent },
            { value: "calc", label: "계산값", content: calcContent },
          ]}
        />
      ) : (
        calcContent
      )}
    </Drawer>
  );
};
