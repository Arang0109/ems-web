import { useCallback, useMemo, useState } from "react";

import type { SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
import { addMinutes } from "@shared/lib";
import { ChipNav } from "@shared/ui/nav";
import { useRemountKey } from "@shared/model";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm, GasColumnKey,
  SamplingPointForm, SampleForm, ParticleForm,
} from "../model/types";
import {
  getDefaultSamplingPointForm, getDefaultSampleForm,
  isParticleCategory,
} from "../model/types";
import {
  getProgressTone, getSectionProgress, getVisibleSections, type SheetSectionId,
} from "../model/section-progress";
import type { AssignedPollutants, ExhaustGasVisibility } from "../model/measured-pollutants";
import { getExhaustGasVisibility, hasSavedExhaustGasValue } from "../model/measured-pollutants";
import {
  DEFAULT_TARGET_VOLUME, calcNozzleEstimates, findNozzleEstimate,
} from "../model/nozzle-estimate";
import { calcParticleSamplingMinutes } from "../model/derived-times";
import { WeatherSection } from "./sections/WeatherSection";
import { MoistureSection } from "./sections/MoistureSection";
import { ExhaustGasSection } from "./sections/ExhaustGasSection";
import { SamplingPointSection } from "./sections/sampling-point";
import { SheetCalcDrawer } from "./calc";
import { ThimbleSection } from "./sections/ThimbleSection";
import { GaseousSection } from "./sections/GaseousSection";

interface Props {
  sheet: SheetForm;
  previewCalc: SheetCalcPreview | null;
  externals: SheetCalcExternals;
  /** 이 측정계획에 배정된 THC·NOx·SOx — 배출가스 섹션의 입력칸 노출을 결정한다 */
  assignedPollutants: AssignedPollutants;
  editable: boolean;
  /** 다른 사용자의 저장으로 방금 갱신된 섹션 — 어디가 바뀌었는지 짚어준다 */
  updatedSections?: SheetSectionId[];
  /** 계산값 드로어의 열림 상태 — 입구가 액션 바에 있어 SheetsEditor 가 소유한다 */
  calcDrawerOpen: boolean;
  onCalcDrawerOpenChange: (open: boolean) => void;
  onChange: (updater: (sheet: SheetForm) => SheetForm) => void;
}

/** 섹션 카드의 DOM id — 섹션 바로가기의 스크롤 이동 대상 */
const sectionDomId = (id: SheetSectionId): string => `sheet-section-${id}`;

// 채취 종료시간 = 시작시간 + Σ지점별 채취시간(분). 시작이 없으면 빈 값.
// 합산 규칙은 타임라인과 공유한다 — 두 곳이 다른 종료시각을 말하면 안 된다.
const calcSamplingEndTime = (start: string, points: SamplingPointForm[]): string =>
  addMinutes(start, calcParticleSamplingMinutes(points)) ?? "";

const withAutoEndTime = (sheet: SheetForm): SheetForm => ({
  ...sheet,
  particle: {
    ...sheet.particle,
    samplingEndTime: calcSamplingEndTime(sheet.particle.samplingStartTime, sheet.samplingPoints),
  },
});

export const SheetFormView = ({
  sheet, previewCalc, externals, assignedPollutants, editable, updatedSections,
  calcDrawerOpen, onCalcDrawerOpenChange, onChange,
}: Props) => {
  // 차압 범위 슬라이더는 열릴 때마다 초기 상태로 되돌린다 (희망 흡입량은 아래에서 유지한다)
  const nozzleFormKey = useRemountKey(calcDrawerOpen);

  // 희망 흡입량은 드로어 밖에 둔다 — 노즐을 고른 뒤에도 같은 기준의 예상치를 계속 보여줘야 한다.
  const [nozzleTargetVolume, setNozzleTargetVolume] = useState(DEFAULT_TARGET_VOLUME);
  const [activeSectionId, setActiveSectionId] = useState<SheetSectionId>("weather");

  const particle = isParticleCategory(sheet.category);
  const sections = useMemo(() => getVisibleSections(particle), [particle]);

  // 이미 입력된 값이 있는 항목은 배정 여부와 무관하게 계속 보여준다.
  // 판정을 마운트 시점으로 고정하는 것이 핵심 — 매 렌더 폼 값을 다시 보면 마지막 글자를
  // 지우는 순간 입력칸이 사라지고 포커스가 날아간다. 시트가 바뀌면 key 리마운트로 갱신된다.
  const [hadSavedValue] = useState<ExhaustGasVisibility>(() => ({
    thc: hasSavedExhaustGasValue(sheet.exhaustGas, "thc"),
    nox: hasSavedExhaustGasValue(sheet.exhaustGas, "nox"),
    sox: hasSavedExhaustGasValue(sheet.exhaustGas, "sox"),
  }));

  const visiblePollutants = useMemo(
    () => getExhaustGasVisibility(assignedPollutants, hadSavedValue),
    [assignedPollutants, hadSavedValue],
  );

  // 첫 섹션만 펼친 상태로 시작한다 — 모바일에서 한 번에 한 섹션씩 채우는 흐름.
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => ({
    weather: true,
  }));

  const setSectionOpen = useCallback((id: SheetSectionId, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [id]: open }));
    if (open) setActiveSectionId(id);
  }, []);

  // 대상 섹션을 펼치고 그 카드로 스크롤한다.
  const goToSection = useCallback((id: SheetSectionId) => {
    setOpenSections((prev) => ({ ...prev, [id]: true }));
    setActiveSectionId(id);
    // 펼침 애니메이션이 시작된 뒤 위치를 잡아야 목표 카드가 화면에 걸린다.
    requestAnimationFrame(() => {
      document.getElementById(sectionDomId(id))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  // 접혀 있는 섹션이 갱신됐을 때도 눈에 띄어야 하므로 배지는 카드 헤더에 붙인다.
  const updated = useMemo(() => new Set(updatedSections ?? []), [updatedSections]);

  const shellProps = (id: SheetSectionId) => {
    const progress = getSectionProgress(sheet, id, visiblePollutants);

    return {
      id: sectionDomId(id),
      open: openSections[id] ?? false,
      onOpenChange: (open: boolean) => setSectionOpen(id, open),
      progress,
      progressTone: getProgressTone(progress),
      highlightLabel: updated.has(id) ? "방금 갱신됨" : undefined,
    };
  };

  const patchWeather = (patch: Partial<WeatherForm>) =>
    onChange((s) => ({ ...s, weather: { ...s.weather, ...patch } }));

  const patchMoisture = (patch: Partial<MoistureForm>) =>
    onChange((s) => ({ ...s, moisture: { ...s.moisture, ...patch } }));

  const patchExhaust = (patch: Partial<ExhaustGasForm>) =>
    onChange((s) => ({ ...s, exhaustGas: { ...s.exhaustGas, ...patch } }));

  const patchReading = (key: GasColumnKey, index: number, value: string) =>
    onChange((s) => ({
      ...s,
      exhaustGas: {
        ...s.exhaustGas,
        [key]: s.exhaustGas[key].map((v, i) => (i === index ? value : v)),
      },
    }));

  const patchPoint = (index: number, patch: Partial<SamplingPointForm>) =>
    onChange((s) => {
      const next = {
        ...s,
        samplingPoints: s.samplingPoints.map((p, i) => (i === index ? { ...p, ...patch } : p)),
      };
      // 채취시간이 바뀌면 종료시간을 재계산한다.
      return "samplingTime" in patch ? withAutoEndTime(next) : next;
    });

  const addPoint = () =>
    onChange((s) => ({ ...s, samplingPoints: [...s.samplingPoints, getDefaultSamplingPointForm()] }));

  const removePoint = (index: number) =>
    onChange((s) => withAutoEndTime({
      ...s,
      samplingPoints: s.samplingPoints.filter((_, i) => i !== index),
    }));

  // 앞 지점 값을 통째로 복사한다 — 지점 간 조건이 비슷한 경우가 많아 다시 입력하는 수고를 던다.
  // 채취시간도 함께 복사되므로 종료시간을 다시 계산한다.
  const copyPreviousPoint = (index: number) =>
    onChange((s) => {
      const previous = s.samplingPoints[index - 1];
      if (!previous) return s;

      return withAutoEndTime({
        ...s,
        samplingPoints: s.samplingPoints.map((p, i) => (i === index ? { ...previous } : p)),
      });
    });

  const patchSample = (index: number, patch: Partial<SampleForm>) =>
    onChange((s) => ({
      ...s,
      samples: s.samples.map((sp, i) => (i === index ? { ...sp, ...patch } : sp)),
    }));

  const addSample = () => onChange((s) => ({ ...s, samples: [...s.samples, getDefaultSampleForm()] }));
  const removeSample = (index: number) =>
    onChange((s) => ({ ...s, samples: s.samples.filter((_, i) => i !== index) }));

  const patchParticle = (patch: Partial<ParticleForm>) =>
    onChange((s) => {
      const next = { ...s, particle: { ...s.particle, ...patch } };
      return "samplingStartTime" in patch ? withAutoEndTime(next) : next;
    });

  const nozzleOptions = externals.nozzleDiameters.map((d) => ({ value: String(d), label: `${d} cm` }));

  // 노즐경 후보별 추정치 — 추천 드로어와 "선택한 노즐 예상치"가 같은 목록을 본다.
  const nozzleEstimates = useMemo(
    () => (particle ? calcNozzleEstimates(sheet, externals, nozzleTargetVolume) : []),
    [particle, sheet, externals, nozzleTargetVolume],
  );

  const nozzleEstimate = useMemo(
    () => findNozzleEstimate(nozzleEstimates, sheet.particle.nozzleSize),
    [nozzleEstimates, sheet.particle.nozzleSize],
  );

  return (
    <div className="space-y-4">
      <ChipNav
        ariaLabel="입력 섹션 바로가기"
        className="sticky top-14 z-10 bg-canvas py-2"
        items={sections}
        activeId={activeSectionId}
        onSelect={(id) => goToSection(id as SheetSectionId)}
      />

      <WeatherSection {...shellProps("weather")}
        weather={sheet.weather} calc={previewCalc?.weather ?? null}
        editable={editable} onChange={patchWeather} />

      <MoistureSection {...shellProps("moisture")}
        moisture={sheet.moisture} calc={previewCalc?.moisture ?? null}
        editable={editable} onChange={patchMoisture} />

      <ExhaustGasSection {...shellProps("exhaust")}
        exhaustGas={sheet.exhaustGas}
        visiblePollutants={visiblePollutants}
        editable={editable} onChange={patchExhaust} onReadingChange={patchReading} />

      <SamplingPointSection {...shellProps("point")}
        isParticle={particle}
        points={sheet.samplingPoints}
        particle={sheet.particle}
        preview={previewCalc}
        editable={editable}
        onPointChange={patchPoint}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        onCopyPreviousPoint={copyPreviousPoint}
        onParticleChange={patchParticle}
      />

      {particle && (
        <ThimbleSection {...shellProps("sample")}
          particle={sheet.particle}
          editable={editable}
          onParticleChange={patchParticle}
        />
      )}

      {/* 가스상 물질은 카테고리와 무관하게 모든 기록지가 작성한다. */}
      <GaseousSection {...shellProps("gaseous")}
        samples={sheet.samples}
        editable={editable}
        onSampleChange={patchSample}
        onAddSample={addSample}
        onRemoveSample={removeSample}
      />


      <SheetCalcDrawer
        key={nozzleFormKey}
        open={calcDrawerOpen}
        onOpenChange={onCalcDrawerOpenChange}
        isParticle={particle}
        particle={sheet.particle}
        points={sheet.samplingPoints}
        preview={previewCalc}
        standardOxygen={externals.standardOxygen}
        visiblePollutants={visiblePollutants}
        nozzleOptions={nozzleOptions}
        recommendations={nozzleEstimates}
        nozzleEstimate={nozzleEstimate}
        targetVolume={nozzleTargetVolume}
        onTargetVolumeChange={setNozzleTargetVolume}
        editable={editable}
        onParticleChange={patchParticle}
      />
    </div>
  );
};
