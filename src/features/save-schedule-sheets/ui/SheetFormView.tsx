import type { MeasurementSheet } from "@entities/schedule";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm, GasReadingForm,
  MeasurementPointForm, SampleForm, ParticleSampleForm,
} from "../model/types";
import {
  getDefaultGasReadingForm, getDefaultMeasurementPointForm, getDefaultSampleForm,
  isParticleCategory,
} from "../model/types";
import { WeatherSection } from "./sections/WeatherSection";
import { MoistureSection } from "./sections/MoistureSection";
import { ExhaustGasSection } from "./sections/ExhaustGasSection";
import { MeasurementPointSection } from "./sections/MeasurementPointSection";
import { SampleSection } from "./sections/SampleSection";
import { ParticleSection } from "./sections/ParticleSection";

interface Props {
  sheet: SheetForm;
  calcSheet: MeasurementSheet | null;
  editable: boolean;
  onChange: (updater: (sheet: SheetForm) => SheetForm) => void;
}

export const SheetFormView = ({ sheet, calcSheet, editable, onChange }: Props) => {
  const patchWeather = (patch: Partial<WeatherForm>) =>
    onChange((s) => ({ ...s, weather: { ...s.weather, ...patch } }));

  const patchMoisture = (patch: Partial<MoistureForm>) =>
    onChange((s) => ({ ...s, moisture: { ...s.moisture, ...patch } }));

  const patchExhaust = (patch: Partial<ExhaustGasForm>) =>
    onChange((s) => ({ ...s, exhaustGas: { ...s.exhaustGas, ...patch } }));

  const patchReading = (index: number, patch: Partial<GasReadingForm>) =>
    onChange((s) => ({
      ...s,
      exhaustGas: {
        ...s.exhaustGas,
        readings: s.exhaustGas.readings.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      },
    }));

  const addReading = () =>
    onChange((s) => ({
      ...s,
      exhaustGas: { ...s.exhaustGas, readings: [...s.exhaustGas.readings, getDefaultGasReadingForm()] },
    }));

  const removeReading = (index: number) =>
    onChange((s) => ({
      ...s,
      exhaustGas: { ...s.exhaustGas, readings: s.exhaustGas.readings.filter((_, i) => i !== index) },
    }));

  const patchPoint = (index: number, patch: Partial<MeasurementPointForm>) =>
    onChange((s) => ({
      ...s,
      measurementPoints: s.measurementPoints.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));

  const addPoint = () =>
    onChange((s) => ({ ...s, measurementPoints: [...s.measurementPoints, getDefaultMeasurementPointForm()] }));

  const removePoint = (index: number) =>
    onChange((s) => ({ ...s, measurementPoints: s.measurementPoints.filter((_, i) => i !== index) }));

  const patchSample = (index: number, patch: Partial<SampleForm>) =>
    onChange((s) => ({
      ...s,
      samples: s.samples.map((sp, i) => (i === index ? { ...sp, ...patch } : sp)),
    }));

  const addSample = () => onChange((s) => ({ ...s, samples: [...s.samples, getDefaultSampleForm()] }));
  const removeSample = (index: number) =>
    onChange((s) => ({ ...s, samples: s.samples.filter((_, i) => i !== index) }));

  const patchParticle = (patch: Partial<ParticleSampleForm>) =>
    onChange((s) => ({ ...s, particleSample: { ...s.particleSample, ...patch } }));

  const particle = isParticleCategory(sheet.category);

  return (
    <div className="space-y-6">
      <WeatherSection weather={sheet.weather} pa={calcSheet?.weather.pa ?? null}
        editable={editable} onChange={patchWeather} />

      <MoistureSection moisture={sheet.moisture} xw={calcSheet?.moisture.xw ?? null}
        editable={editable} onChange={patchMoisture} />

      <ExhaustGasSection exhaustGas={sheet.exhaustGas}
        gasDensity={calcSheet?.exhaustGas.gasDensity ?? null}
        o2CorrectionFactor={calcSheet?.exhaustGas.o2CorrectionFactor ?? null}
        editable={editable} onChange={patchExhaust}
        onReadingChange={patchReading} onAddReading={addReading} onRemoveReading={removeReading} />

      <MeasurementPointSection points={sheet.measurementPoints}
        avgTg={calcSheet?.avgTg ?? null} avgPv={calcSheet?.avgPv ?? null} avgPs={calcSheet?.avgPs ?? null}
        editable={editable} onPointChange={patchPoint} onAddPoint={addPoint} onRemovePoint={removePoint} />

      {particle && (
        <>
          <ParticleSection particle={sheet.particleSample} cp={calcSheet?.particleSample.Cp ?? null}
            editable={editable} onChange={patchParticle} />
          <SampleSection samples={sheet.samples} editable={editable}
            onSampleChange={patchSample} onAddSample={addSample} onRemoveSample={removeSample} />
        </>
      )}
    </div>
  );
};
