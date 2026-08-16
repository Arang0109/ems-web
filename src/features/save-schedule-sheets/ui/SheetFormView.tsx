import { useCallback, useMemo, useState } from "react";

import type { SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
import { addMinutes, toNumberOrNull } from "@shared/lib";
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
  getSectionProgress, getVisibleSections, type SheetSectionId,
} from "../model/section-progress";
import { WeatherSection } from "./sections/WeatherSection";
import { MoistureSection } from "./sections/MoistureSection";
import { ExhaustGasSection } from "./sections/ExhaustGasSection";
import { SamplingPointSection } from "./sections/SamplingPointSection";
import { ThimbleSampleSection } from "./sections/ThimbleSampleSection";
import { NozzleRecommendModal } from "./NozzleRecommendModal";

interface Props {
  sheet: SheetForm;
  previewCalc: SheetCalcPreview | null;
  externals: SheetCalcExternals;
  editable: boolean;
  onChange: (updater: (sheet: SheetForm) => SheetForm) => void;
}

/** 섹션 카드의 DOM id — 섹션 바로가기의 스크롤 이동 대상 */
const sectionDomId = (id: SheetSectionId): string => `sheet-section-${id}`;

// 채취 종료시간 = 시작시간 + Σ지점별 채취시간(분). 시작이 없으면 빈 값.
const calcSamplingEndTime = (start: string, points: SamplingPointForm[]): string => {
  const total = points.reduce((acc, p) => acc + (toNumberOrNull(p.samplingTime) ?? 0), 0);
  return addMinutes(start, total) ?? "";
};

const withAutoEndTime = (sheet: SheetForm): SheetForm => ({
  ...sheet,
  particle: {
    ...sheet.particle,
    samplingEndTime: calcSamplingEndTime(sheet.particle.samplingStartTime, sheet.samplingPoints),
  },
});

export const SheetFormView = ({ sheet, previewCalc, externals, editable, onChange }: Props) => {
  const [nozzleModalOpen, setNozzleModalOpen] = useState(false);

  // 열릴 때마다 폼을 초기 상태로 되돌린다
  const nozzleFormKey = useRemountKey(nozzleModalOpen);
  const [activeSectionId, setActiveSectionId] = useState<SheetSectionId>("weather");

  const particle = isParticleCategory(sheet.category);
  const sections = useMemo(() => getVisibleSections(particle), [particle]);

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

  const shellProps = (id: SheetSectionId) => ({
    id: sectionDomId(id),
    open: openSections[id] ?? false,
    onOpenChange: (open: boolean) => setSectionOpen(id, open),
    progress: getSectionProgress(sheet, id),
  });

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
        exhaustGas={sheet.exhaustGas} calc={previewCalc?.exhaustGas ?? null}
        standardOxygen={externals.standardOxygen}
        editable={editable} onChange={patchExhaust} onReadingChange={patchReading} />

      <SamplingPointSection {...shellProps("point")}
        isParticle={particle}
        points={sheet.samplingPoints}
        particle={sheet.particle}
        preview={previewCalc}
        nozzleOptions={nozzleOptions}
        editable={editable}
        onPointChange={patchPoint}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        onCopyPreviousPoint={copyPreviousPoint}
        onParticleChange={patchParticle}
        onOpenNozzleRecommend={() => setNozzleModalOpen(true)}
      />

      {particle && (
        <ThimbleSampleSection {...shellProps("sample")}
          particle={sheet.particle}
          samples={sheet.samples}
          editable={editable}
          onParticleChange={patchParticle}
          onSampleChange={patchSample}
          onAddSample={addSample}
          onRemoveSample={removeSample}
        />
      )}

      <NozzleRecommendModal
        key={nozzleFormKey}
        open={nozzleModalOpen}
        onOpenChange={setNozzleModalOpen}
        sheet={sheet}
        externals={externals}
        onSelect={(nozzleSize) => {
          patchParticle({ nozzleSize });
          setNozzleModalOpen(false);
        }}
      />
    </div>
  );
};
