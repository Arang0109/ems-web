import { useState } from "react";

import type { SheetCalcExternals, SheetCalcPreview } from "@entities/schedule";
import { toNumberOrNull } from "@shared/lib";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm, GasColumnKey,
  SamplingPointForm, SampleForm, ParticleForm,
} from "../model/types";
import {
  getDefaultSamplingPointForm, getDefaultSampleForm,
  isParticleCategory,
} from "../model/types";
import { WeatherSection } from "./sections/WeatherSection";
import { MoistureSection } from "./sections/MoistureSection";
import { ExhaustGasSection } from "./sections/ExhaustGasSection";
import { SamplingPointSection } from "./sections/SamplingPointSection";
import { ThimbleSection } from "./sections/ThimbleSection";
import { SampleSection } from "./sections/SampleSection";
import { NozzleRecommendModal } from "./NozzleRecommendModal";

interface Props {
  sheet: SheetForm;
  previewCalc: SheetCalcPreview | null;
  externals: SheetCalcExternals;
  editable: boolean;
  onChange: (updater: (sheet: SheetForm) => SheetForm) => void;
}

// 채취 종료시간 = 시작시간 + Σ지점별 채취시간(분). 시작이 없으면 빈 값.
const calcSamplingEndTime = (start: string, points: SamplingPointForm[]): string => {
  if (!start) return "";
  const [h, m] = start.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const total = points.reduce((acc, p) => acc + (toNumberOrNull(p.samplingTime) ?? 0), 0);
  const totalMin = h * 60 + m + Math.round(total);
  const hh = String(Math.floor(totalMin / 60) % 24).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  return `${hh}:${mm}`;
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

  const particle = isParticleCategory(sheet.category);
  const nozzleOptions = externals.nozzleDiameters.map((d) => ({ value: String(d), label: `${d} cm` }));

  return (
    <div className="space-y-4">
      <WeatherSection weather={sheet.weather} calc={previewCalc?.weather ?? null}
        editable={editable} onChange={patchWeather} />

      <MoistureSection moisture={sheet.moisture} calc={previewCalc?.moisture ?? null}
        editable={editable} onChange={patchMoisture} />

      <ExhaustGasSection exhaustGas={sheet.exhaustGas} calc={previewCalc?.exhaustGas ?? null}
        standardOxygen={externals.standardOxygen}
        editable={editable} onChange={patchExhaust} onReadingChange={patchReading} />

      <SamplingPointSection
        isParticle={particle}
        points={sheet.samplingPoints}
        particle={sheet.particle}
        preview={previewCalc}
        nozzleOptions={nozzleOptions}
        editable={editable}
        onPointChange={patchPoint}
        onAddPoint={addPoint}
        onRemovePoint={removePoint}
        onParticleChange={patchParticle}
        onOpenNozzleRecommend={() => setNozzleModalOpen(true)}
      />

      {particle && (
        <>
          <ThimbleSection particle={sheet.particle} editable={editable} onChange={patchParticle} />
          <SampleSection samples={sheet.samples} editable={editable}
            onSampleChange={patchSample} onAddSample={addSample} onRemoveSample={removeSample} />
        </>
      )}

      <NozzleRecommendModal
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
