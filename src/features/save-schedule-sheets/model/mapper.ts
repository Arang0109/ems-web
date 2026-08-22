import type {
  BasicInfo, BasicInfoUpdate, MeasurementSheet, Sample, SamplingPoint, SheetSave, TeamSnapshot,
} from "@entities/schedule";
import type { WeatherCondition, WindDirection } from "@shared/model";
import { formatTime, toFormValue, toNumberOrNull, trimValue, unformatTime } from "@shared/lib";

import type {
  SheetForm, WeatherForm, MoistureForm, ExhaustGasForm,
  SamplingPointForm, SampleForm, ParticleForm, ScheduleBasicInfoForm,
} from "./types";
import {
  GAS_READING_COUNT, isParticleCategory,
  getDefaultWeatherForm, getDefaultMoistureForm, getDefaultExhaustGasForm,
} from "./types";

// ── Form → Domain ──────────────────────────────────────────────
// 숫자는 전부 nullable(빈 입력 → null). 계산결과 필드는 null로 두어 서버가 채우게 한다.
// 입자상 영역(시트 particle·측정점 particle)은 입자상 카테고리에서만 구성한다(가스상은 null).

const n = toNumberOrNull;

export const toSheetSave = (form: SheetForm): SheetSave => {
  const particle = isParticleCategory(form.category);
  // nozzleSize는 UI상 시트당 1개 선택 → 전 측정점에 동일 기입(fan-out)
  const nozzleSize = n(form.particle.nozzleSize);

  return {
    category: form.category,
    // 서버 소유 값 — 읽어간 그대로 돌려보내야 서버가 동시 편집 충돌을 판정할 수 있다.
    version: form.version,
    weather: {
      pressure: n(form.weather.pressure),
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
      samplingStartTime: unformatTime(form.moisture.samplingStartTime),
      samplingEndTime: unformatTime(form.moisture.samplingEndTime),
      pm_g: null, tm_g: null, vm_g: null, ma: null, xw: null,
    },
    exhaustGas: {
      o2Concentration: toColumn(form.exhaustGas.o2),
      co2Concentration: toColumn(form.exhaustGas.co2),
      coConcentration: toColumn(form.exhaustGas.co),
      noxConcentration: toColumn(form.exhaustGas.nox),
      soxConcentration: toColumn(form.exhaustGas.sox),
      gasAnalyzerStartTime: unformatTime(form.exhaustGas.gasAnalyzerStartTime),
      thcAnalyzerStartTime: unformatTime(form.exhaustGas.thcAnalyzerStartTime),
      standardGasDensity: null,
      o2CorrectionFactor: null,
    },
    quantity: null,                       // 유량 집계는 전부 서버 계산
    particle: particle
      ? {
          avgKFactor: null, avgOrificeDp: null, avgIsokineticRatio: null,
          totalVm: null, totalSamplingTime: null,
          samplingStartTime: unformatTime(form.particle.samplingStartTime),
          samplingEndTime: unformatTime(form.particle.samplingEndTime),
          thimbleFilter: trimValue(form.particle.thimbleFilter),
          bgThimbleFilter: trimValue(form.particle.bgThimbleFilter),
        }
      : null,
    samplingPoints: form.samplingPoints.map((p) => ({
      Ts: n(p.Ts), Pv: n(p.Pv), Ps: n(p.Ps),
      Vs: null, gasDensity: null,
      particle: particle
        ? {
            equipmentTemperature: { inTm: n(p.inTm), outTm: n(p.outTm), avgTm: null },
            equipmentVolume: { beforeVm: n(p.beforeVm), afterVm: n(p.afterVm) },
            samplingTime: n(p.samplingTime),
            vacuumGaugePressure: n(p.vacuumGaugePressure),
            finalImpingerTemperature: n(p.finalImpingerTemperature),
            nozzleSize,
            Vm: null, Vlc: null, kFactor: null, orificeDp: null, isokineticRatio: null,
          }
        : null,
    })),
    samples: form.samples.map((s) => ({
      sampleName: trimValue(s.sampleName),
      startTime: unformatTime(s.startTime),
      endTime: unformatTime(s.endTime),
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
    samplingPointCnt: null,               // 서버가 굴뚝 치수로 산출(배열 길이 아님)
    avgTm: null,
  };
};

// 3회 중 실제로 입력된 값만 보낸다. 서버 평균은 null을 0으로 치므로 빈 회차는 제외한다.
const toColumn = (values: string[]): number[] =>
  values.map(n).filter((v): v is number => v !== null);

// ── Domain → Form ──────────────────────────────────────────────
// 조회된 기존 시트를 폼 초기값으로 채운다.

// 농도 배열 → 항상 GAS_READING_COUNT 길이의 Form 컬럼 (모자란 회차는 빈 문자열)
const fromColumn = (values: number[] | undefined): string[] =>
  Array.from({ length: GAS_READING_COUNT }, (_, i) => toFormValue(values?.[i]));

// 서버는 블록 자체를 비워서 줄 수 있다 — 이전 회차 불러오기는 그 회차에만 유효한 기상 조건을
// weather: null 로 내려준다. 블록이 없으면 신규 시트와 같은 상태이므로 기본 폼으로 채운다.
export const fromSheet = (sheet: MeasurementSheet): SheetForm => ({
  category: sheet.category,
  version: sheet.version,
  weather: fromWeather(sheet.weather),
  moisture: fromMoisture(sheet.moisture),
  exhaustGas: fromExhaustGas(sheet.exhaustGas),
  samplingPoints: (sheet.samplingPoints ?? []).map(fromPoint),
  samples: (sheet.samples ?? []).map(fromSample),
  particle: fromParticle(sheet),
});

const fromWeather = (w: MeasurementSheet["weather"]): WeatherForm => (
  w ? {
    pressure: toFormValue(w.pressure),
    weatherCondition: w.weatherCondition ?? "",
    temperature: toFormValue(w.temperature),
    humidity: toFormValue(w.humidity),
    windDirection: w.windDirection ?? "",
    windSpeed: toFormValue(w.windSpeed),
  } : getDefaultWeatherForm()
);

const fromMoisture = (m: MeasurementSheet["moisture"]): MoistureForm => (
  m ? {
    weightBefore: toFormValue(m.weight?.before),
    weightAfter: toFormValue(m.weight?.after),
    gasMeterTempIn: toFormValue(m.gasMeterTemperature?.in),
    gasMeterTempOut: toFormValue(m.gasMeterTemperature?.out),
    dryGasVolumeBefore: toFormValue(m.dryGasVolume?.before),
    dryGasVolumeAfter: toFormValue(m.dryGasVolume?.after),
    suctionVelocity: toFormValue(m.suctionVelocity),
    gasMeterGaugePressure: toFormValue(m.gasMeterGaugePressure),
    samplingStartTime: formatTime(m.samplingStartTime),
    samplingEndTime: formatTime(m.samplingEndTime),
  } : getDefaultMoistureForm()
);

const fromExhaustGas = (g: MeasurementSheet["exhaustGas"]): ExhaustGasForm => (
  g ? {
    o2: fromColumn(g.o2Concentration),
    co2: fromColumn(g.co2Concentration),
    co: fromColumn(g.coConcentration),
    nox: fromColumn(g.noxConcentration),
    sox: fromColumn(g.soxConcentration),
    gasAnalyzerStartTime: formatTime(g.gasAnalyzerStartTime),
    thcAnalyzerStartTime: formatTime(g.thcAnalyzerStartTime),
  } : getDefaultExhaustGasForm()
);

const fromPoint = (p: SamplingPoint): SamplingPointForm => ({
  Ts: toFormValue(p.Ts), Pv: toFormValue(p.Pv), Ps: toFormValue(p.Ps),
  inTm: toFormValue(p.particle?.equipmentTemperature?.inTm),
  outTm: toFormValue(p.particle?.equipmentTemperature?.outTm),
  beforeVm: toFormValue(p.particle?.equipmentVolume?.beforeVm),
  afterVm: toFormValue(p.particle?.equipmentVolume?.afterVm),
  samplingTime: toFormValue(p.particle?.samplingTime),
  vacuumGaugePressure: toFormValue(p.particle?.vacuumGaugePressure),
  finalImpingerTemperature: toFormValue(p.particle?.finalImpingerTemperature),
});

const fromSample = (sp: Sample): SampleForm => ({
  sampleName: sp.sampleName ?? "",
  startTime: formatTime(sp.startTime),
  endTime: formatTime(sp.endTime),
  suctionQuantity: toFormValue(sp.suctionQuantity),
  gasMeterGaugePressure: toFormValue(sp.gasMeterGaugePressure),
  inTemperature: toFormValue(sp.inTemperature),
  outTemperature: toFormValue(sp.outTemperature),
  beforeVolume: toFormValue(sp.beforeVolume),
  afterVolume: toFormValue(sp.afterVolume),
  blankSampleNumber: sp.blankSampleNumber ?? "",
  sampleNumber: sp.sampleNumber ?? "",
  samplingVolume: toFormValue(sp.samplingVolume),
});

// nozzleSize는 측정점별 저장이지만 UI는 시트당 1개 — 첫 non-null 측정점 값을 채택한다.
const fromParticle = (sheet: MeasurementSheet): ParticleForm => {
  const nozzleSize = (sheet.samplingPoints ?? [])
    .map((p) => p.particle?.nozzleSize)
    .find((v): v is number => v != null);

  return {
    nozzleSize: toFormValue(nozzleSize),
    samplingStartTime: formatTime(sheet.particle?.samplingStartTime),
    samplingEndTime: formatTime(sheet.particle?.samplingEndTime),
    thimbleFilter: sheet.particle?.thimbleFilter ?? "",
    bgThimbleFilter: sheet.particle?.bgThimbleFilter ?? "",
  };
};

// ── 공통 정보 (basicInfo) ──────────────────────────────────────
// 시트가 아니라 측정계획 스냅샷 단위의 값이다.

// 서버는 null(문자열은 blank 포함)을 "기존 값 유지"로 해석하므로,
// 이번 폼이 다루지 않는 접수/분석/발행일자는 null로 두어 보존시킨다.
export const toBasicInfoUpdate = (form: ScheduleBasicInfoForm): BasicInfoUpdate => ({
  facilityManager: trimValue(form.facilityManager),
  samplingWitness: trimValue(form.samplingWitness),
  analyst: trimValue(form.analyst),
  technicalManager: trimValue(form.technicalManager),
  receivedAt: null,
  analyzedAt: null,
  issuedAt: null,
  samplingStartedAt: unformatTime(form.samplingStartedAt),
  samplingEndedAt: unformatTime(form.samplingEndedAt),
  mentorName: trimValue(form.mentorName),
  menteeName: trimValue(form.menteeName),
});

// 채취자 표기명만 team 스냅샷 소관이라 basicInfo와 함께 받는다.
export const fromBasicInfo = (
  basicInfo: BasicInfo | null,
  team: TeamSnapshot | null,
): ScheduleBasicInfoForm => ({
  samplingStartedAt: formatTime(basicInfo?.samplingStartedAt),
  samplingEndedAt: formatTime(basicInfo?.samplingEndedAt),
  facilityManager: basicInfo?.facilityManager ?? "",
  samplingWitness: basicInfo?.samplingWitness ?? "",
  analyst: basicInfo?.analyst ?? "",
  technicalManager: basicInfo?.technicalManager ?? "",
  mentorName: team?.mentorName ?? "",
  menteeName: team?.menteeName ?? "",
});
