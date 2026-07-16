import type { MeasurementSheet, SheetSave } from "@entities/schedule";
import type { WeatherCondition, WindDirection } from "@shared/model";
import { toNumberOrNull, trimValue } from "@shared/lib";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm,
  MeasurementPointForm, SampleForm, ParticleSampleForm,
} from "./types";

// ── Form → Domain ──────────────────────────────────────────────
// 숫자는 전부 nullable(빈 입력 → null). 계산결과 필드는 null로 두어 서버가 채우게 한다.

// Form "HH:mm" → 서버 "HH:mm:ss"
const toTime = (s: string): string | null => {
  const t = trimValue(s);
  if (!t) return null;
  return t.length === 5 ? `${t}:00` : t;
};

const n = toNumberOrNull;

export const toSheetSave = (form: SheetForm): SheetSave => ({
  category: form.category,
  weather: {
    pressure: { pressure: n(form.weather.pressure), unit: form.weather.unit || "hPa" },
    weatherCondition: (form.weather.weatherCondition || null) as WeatherCondition | null,
    temperature: n(form.weather.temperature),
    humidity: n(form.weather.humidity),
    windDirection: (form.weather.windDirection || null) as WindDirection | null,
    windSpeed: n(form.weather.windSpeed),
    pa: null,
  },
  moisture: {
    weight: { before: n(form.moisture.weightBefore), after: n(form.moisture.weightAfter) },
    gasMeterTemperature: { in: n(form.moisture.gasMeterTempIn), out: n(form.moisture.gasMeterTempOut) },
    dryGasVolume: { before: n(form.moisture.dryGasVolumeBefore), after: n(form.moisture.dryGasVolumeAfter) },
    suctionVelocity: n(form.moisture.suctionVelocity),
    gasMeterGaugePressure: n(form.moisture.gasMeterGaugePressure),
    xw: null,
  },
  exhaustGas: {
    o2Concentration: pickColumn(form.exhaustGas, (r) => r.o2),
    co2Concentration: pickColumn(form.exhaustGas, (r) => r.co2),
    coConcentration: pickColumn(form.exhaustGas, (r) => r.co),
    noxConcentration: pickColumn(form.exhaustGas, (r) => r.nox),
    soxConcentration: pickColumn(form.exhaustGas, (r) => r.sox),
    gasAnalyzerStartTime: toTime(form.exhaustGas.gasAnalyzerStartTime),
    thcAnalyzerStartTime: toTime(form.exhaustGas.thcAnalyzerStartTime),
    gasDensity: null,
    o2CorrectionFactor: null,
  },
  measurementPoints: form.measurementPoints.map((p) => ({
    Ts: n(p.Ts), Pv: n(p.Pv), Ps: n(p.Ps),
    equipmentTemperature: { inTm: n(p.inTm), outTm: n(p.outTm), avgTm: null },
    equipmentVolume: { beforeVm: n(p.beforeVm), afterVm: n(p.afterVm) },
    samplingTime: n(p.samplingTime),
    vacuumGaugePressure: n(p.vacuumGaugePressure),
    finalImpingerTemperature: n(p.finalImpingerTemperature),
    Vs: null, gasDensity: null, Vm: null, Vlc: null, kFactor: null,
    orificeDp: null, isokineticRatio: null,
  })),
  samples: form.samples.map((s) => ({
    sampleName: trimValue(s.sampleName),
    startTime: toTime(s.startTime),
    endTime: toTime(s.endTime),
    suctionQuantity: n(s.suctionQuantity),
    gasMeterGaugePressure: n(s.gasMeterGaugePressure),
    inTemperature: n(s.inTemperature),
    outTemperature: n(s.outTemperature),
    beforeVolume: n(s.beforeVolume),
    afterVolume: n(s.afterVolume),
    blankSampleNumber: trimValue(s.blankSampleNumber),
    sampleNumber: trimValue(s.sampleNumber),
    samplingVolume: n(s.samplingVolume),
  })),
  particleSample: {
    Cp: null,
    nozzleSize: n(form.particleSample.nozzleSize),
    Vm: n(form.particleSample.Vm),
    samplingTime: n(form.particleSample.samplingTime),
    measureStartTime: toTime(form.particleSample.measureStartTime),
    measureEndTime: toTime(form.particleSample.measureEndTime),
    kFactor: null, orificeDp: null, isokineticRatio: null,
    samplingStartTime: toTime(form.particleSample.samplingStartTime),
    samplingEndTime: toTime(form.particleSample.samplingEndTime),
    thimbleFilter: trimValue(form.particleSample.thimbleFilter),
    bgThimbleFilter: trimValue(form.particleSample.bgThimbleFilter),
  },
  avgTg: null, avgPv: null, avgPs: null, avgTm: null, quantity: null,
});

// 측정 회수(row) 중 값이 하나라도 있는 열만 배열로 뽑는다.
const pickColumn = (gas: ExhaustGasForm, get: (r: ExhaustGasForm["readings"][number]) => string): number[] =>
  gas.readings
    .map((r) => n(get(r)))
    .filter((v): v is number => v !== null);

// ── Domain → Form ──────────────────────────────────────────────
// 조회된 기존 시트를 폼 초기값으로 채운다.

// 숫자 → 문자열 (null → "")
const s = (v: number | null | undefined): string => (v == null ? "" : String(v));
// 서버 "HH:mm:ss" → Form "HH:mm"
const fromTime = (v: string | null | undefined): string => (v ? v.slice(0, 5) : "");

export const fromSheet = (sheet: MeasurementSheet): SheetForm => {
  const readingCount = Math.max(
    sheet.exhaustGas.o2Concentration.length,
    sheet.exhaustGas.co2Concentration.length,
    sheet.exhaustGas.coConcentration.length,
    sheet.exhaustGas.noxConcentration.length,
    sheet.exhaustGas.soxConcentration.length,
    1,
  );

  return {
    category: sheet.category,
    weather: fromWeather(sheet.weather),
    moisture: fromMoisture(sheet.moisture),
    exhaustGas: {
      readings: Array.from({ length: readingCount }, (_, i) => ({
        o2: s(sheet.exhaustGas.o2Concentration[i]),
        co2: s(sheet.exhaustGas.co2Concentration[i]),
        co: s(sheet.exhaustGas.coConcentration[i]),
        nox: s(sheet.exhaustGas.noxConcentration[i]),
        sox: s(sheet.exhaustGas.soxConcentration[i]),
      })),
      gasAnalyzerStartTime: fromTime(sheet.exhaustGas.gasAnalyzerStartTime),
      thcAnalyzerStartTime: fromTime(sheet.exhaustGas.thcAnalyzerStartTime),
    },
    measurementPoints: (sheet.measurementPoints.length ? sheet.measurementPoints : []).map(fromPoint),
    samples: sheet.samples.map(fromSample),
    particleSample: fromParticle(sheet.particleSample),
  };
};

const fromWeather = (w: MeasurementSheet["weather"]): WeatherForm => ({
  pressure: s(w.pressure?.pressure),
  unit: w.pressure?.unit || "hPa",
  weatherCondition: w.weatherCondition ?? "",
  temperature: s(w.temperature),
  humidity: s(w.humidity),
  windDirection: w.windDirection ?? "",
  windSpeed: s(w.windSpeed),
});

const fromMoisture = (m: MeasurementSheet["moisture"]): MoistureForm => ({
  weightBefore: s(m.weight?.before),
  weightAfter: s(m.weight?.after),
  gasMeterTempIn: s(m.gasMeterTemperature?.in),
  gasMeterTempOut: s(m.gasMeterTemperature?.out),
  dryGasVolumeBefore: s(m.dryGasVolume?.before),
  dryGasVolumeAfter: s(m.dryGasVolume?.after),
  suctionVelocity: s(m.suctionVelocity),
  gasMeterGaugePressure: s(m.gasMeterGaugePressure),
});

const fromPoint = (p: MeasurementSheet["measurementPoints"][number]): MeasurementPointForm => ({
  Ts: s(p.Ts), Pv: s(p.Pv), Ps: s(p.Ps),
  inTm: s(p.equipmentTemperature?.inTm),
  outTm: s(p.equipmentTemperature?.outTm),
  beforeVm: s(p.equipmentVolume?.beforeVm),
  afterVm: s(p.equipmentVolume?.afterVm),
  samplingTime: s(p.samplingTime),
  vacuumGaugePressure: s(p.vacuumGaugePressure),
  finalImpingerTemperature: s(p.finalImpingerTemperature),
});

const fromSample = (sp: MeasurementSheet["samples"][number]): SampleForm => ({
  sampleName: sp.sampleName ?? "",
  startTime: fromTime(sp.startTime),
  endTime: fromTime(sp.endTime),
  suctionQuantity: s(sp.suctionQuantity),
  gasMeterGaugePressure: s(sp.gasMeterGaugePressure),
  inTemperature: s(sp.inTemperature),
  outTemperature: s(sp.outTemperature),
  beforeVolume: s(sp.beforeVolume),
  afterVolume: s(sp.afterVolume),
  blankSampleNumber: sp.blankSampleNumber ?? "",
  sampleNumber: sp.sampleNumber ?? "",
  samplingVolume: s(sp.samplingVolume),
});

const fromParticle = (pt: MeasurementSheet["particleSample"]): ParticleSampleForm => ({
  nozzleSize: s(pt?.nozzleSize),
  Vm: s(pt?.Vm),
  samplingTime: s(pt?.samplingTime),
  measureStartTime: fromTime(pt?.measureStartTime),
  measureEndTime: fromTime(pt?.measureEndTime),
  samplingStartTime: fromTime(pt?.samplingStartTime),
  samplingEndTime: fromTime(pt?.samplingEndTime),
  thimbleFilter: pt?.thimbleFilter ?? "",
  bgThimbleFilter: pt?.bgThimbleFilter ?? "",
});
