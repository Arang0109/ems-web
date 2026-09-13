import type {
  GaseousSampling, SamplingInfoSave, SamplingPoint, SamplingSheet, SamplingSnapshot, SheetSave,
  TeamSnapshot, TeamSnapshotUpdate, TenantSnapshot, TenantSnapshotUpdate,
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
// 입자상 영역(시트 particulateSampling·측정점 isokineticSampling)은 입자상 카테고리에서만
// 구성한다(가스상은 null).

const n = toNumberOrNull;

export const toSheetSave = (form: SheetForm): SheetSave => {
  const particle = isParticleCategory(form.category);
  // 노즐경은 UI상 시트당 1개 선택 → 전 측정점에 동일 기입(fan-out)
  const nozzleDiameter = n(form.particle.nozzleSize);

  return {
    category: form.category,
    // 서버 소유 값 — 읽어간 그대로 돌려보내야 서버가 동시 편집 충돌을 판정할 수 있다.
    version: form.version,
    weather: {
      atmosphericPressure: n(form.weather.pressure),
      weatherCondition: (form.weather.weatherCondition || null) as WeatherCondition | null,
      temperature: n(form.weather.temperature),
      humidity: n(form.weather.humidity),
      windDirection: (form.weather.windDirection || null) as WindDirection | null,
      windSpeed: n(form.weather.windSpeed),
      atmosphericPressureMmHg: null,
    },
    moisture: {
      bottleWeight: { before: n(form.moisture.weightBefore), after: n(form.moisture.weightAfter) },
      gasMeterTemperature: { in: n(form.moisture.gasMeterTempIn), out: n(form.moisture.gasMeterTempOut) },
      dryGasVolume: { before: n(form.moisture.dryGasVolumeBefore), after: n(form.moisture.dryGasVolumeAfter) },
      suctionVelocity: n(form.moisture.suctionVelocity),
      gasMeterGaugePressure: n(form.moisture.gasMeterGaugePressure),
      samplingStartTime: unformatTime(form.moisture.samplingStartTime),
      samplingEndTime: unformatTime(form.moisture.samplingEndTime),
      gasMeterGaugePressureMmHg: null,
      gasMeterGaugePressureInH2O: null,
      averageGasMeterTemperature: null,
      sampledDryGasVolume: null,
      absorbedMoistureMass: null,
      moistureRatio: null,
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
      avgO2: null, avgCo2: null, avgCo: null, avgNox: null, avgSox: null,
    },
    flowRate: null,                       // 유량 집계는 전부 서버 계산
    particulateSampling: particle
      ? {
          averageKFactor: null,
          averageOrificeDifferentialPressure: null,
          averageIsokineticRatio: null,
          appliedNozzleDiameter: null,
          nozzleArea: null,
          averageGasMeterTemperature: null,
          totalDryGasVolume: null,
          totalSamplingTime: null,
          samplingStartedAt: unformatTime(form.particle.samplingStartTime),
          samplingEndedAt: unformatTime(form.particle.samplingEndTime),
          thimbleFilter: trimValue(form.particle.thimbleFilter),
          bgThimbleFilter: trimValue(form.particle.bgThimbleFilter),
        }
      : null,
    samplingPoints: form.samplingPoints.map((p) => ({
      gasTemperature: n(p.Ts),
      dynamicPressure: n(p.Pv),
      staticPressure: n(p.Ps),
      gasVelocity: null,
      gasDensity: null,
      isokineticSampling: particle
        ? {
            gasTemperature: { inlet: n(p.inTm), outlet: n(p.outTm), average: null },
            gasMeterVolume: { before: n(p.beforeVm), after: n(p.afterVm) },
            samplingTime: n(p.samplingTime),
            vacuumGaugePressure: n(p.vacuumGaugePressure),
            finalImpingerTemperature: n(p.finalImpingerTemperature),
            nozzleDiameter,
            sampledDryGasVolume: null,
            collectedWaterVolume: null,
            kFactor: null,
            orificeDifferentialPressure: null,
            isokineticRatio: null,
          }
        : null,
    })),
    gaseousSamplings: form.samples.map((s) => ({
      pollutantIds: s.pollutantIds,
      sampleName: trimValue(s.sampleName),
      samplingStartedAt: unformatTime(s.startTime),
      samplingEndedAt: unformatTime(s.endTime),
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
    samplingPointCount: null,             // 서버가 굴뚝 치수로 산출(배열 길이 아님)
  };
};

// 3회 중 실제로 입력된 값만 보낸다. 서버 평균은 null을 0으로 치므로 빈 회차는 제외한다.
const toColumn = (values: string[]): number[] =>
  values.map(n).filter((v): v is number => v !== null);

// ── Domain → Form ──────────────────────────────────────────────
// 조회된 기존 기록지를 폼 초기값으로 채운다.

// 농도 배열 → 항상 GAS_READING_COUNT 길이의 Form 컬럼 (모자란 회차는 빈 문자열)
const fromColumn = (values: number[] | undefined): string[] =>
  Array.from({ length: GAS_READING_COUNT }, (_, i) => toFormValue(values?.[i]));

// 서버는 블록 자체를 비워서 줄 수 있다 — 이전 회차 불러오기는 그 회차에만 유효한 기상 조건을
// 비우고 대기압만 남기는데, 남길 대기압조차 없으면 weather: null 로 준다.
// 블록이 없으면 신규 시트와 같은 상태이므로 기본 폼으로 채운다.
export const fromSheet = (sheet: SamplingSheet): SheetForm => ({
  category: sheet.category,
  version: sheet.version,
  weather: fromWeather(sheet.weather),
  moisture: fromMoisture(sheet.moisture),
  exhaustGas: fromExhaustGas(sheet.exhaustGas),
  samplingPoints: (sheet.samplingPoints ?? []).map(fromPoint),
  samples: (sheet.gaseousSamplings ?? []).map(fromSample),
  particle: fromParticle(sheet),
});

const fromWeather = (w: SamplingSheet["weather"]): WeatherForm => (
  w ? {
    pressure: toFormValue(w.atmosphericPressure),
    weatherCondition: w.weatherCondition ?? "",
    temperature: toFormValue(w.temperature),
    humidity: toFormValue(w.humidity),
    windDirection: w.windDirection ?? "",
    windSpeed: toFormValue(w.windSpeed),
  } : getDefaultWeatherForm()
);

const fromMoisture = (m: SamplingSheet["moisture"]): MoistureForm => (
  m ? {
    weightBefore: toFormValue(m.bottleWeight?.before),
    weightAfter: toFormValue(m.bottleWeight?.after),
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

const fromExhaustGas = (g: SamplingSheet["exhaustGas"]): ExhaustGasForm => (
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
  Ts: toFormValue(p.gasTemperature),
  Pv: toFormValue(p.dynamicPressure),
  Ps: toFormValue(p.staticPressure),
  inTm: toFormValue(p.isokineticSampling?.gasTemperature?.inlet),
  outTm: toFormValue(p.isokineticSampling?.gasTemperature?.outlet),
  beforeVm: toFormValue(p.isokineticSampling?.gasMeterVolume?.before),
  afterVm: toFormValue(p.isokineticSampling?.gasMeterVolume?.after),
  samplingTime: toFormValue(p.isokineticSampling?.samplingTime),
  vacuumGaugePressure: toFormValue(p.isokineticSampling?.vacuumGaugePressure),
  finalImpingerTemperature: toFormValue(p.isokineticSampling?.finalImpingerTemperature),
});

const fromSample = (sp: GaseousSampling): SampleForm => ({
  // 구 문서와 사용자가 직접 추가한 행은 링크가 없다 — 수동 행과 같게 취급한다.
  pollutantIds: sp.pollutantIds ?? [],
  sampleName: sp.sampleName ?? "",
  startTime: formatTime(sp.samplingStartedAt),
  endTime: formatTime(sp.samplingEndedAt),
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

// 노즐경은 측정점별 저장이지만 UI는 시트당 1개 — 첫 non-null 측정점 값을 채택한다.
const fromParticle = (sheet: SamplingSheet): ParticleForm => {
  const nozzleSize = (sheet.samplingPoints ?? [])
    .map((p) => p.isokineticSampling?.nozzleDiameter)
    .find((v): v is number => v != null);

  return {
    nozzleSize: toFormValue(nozzleSize),
    samplingStartTime: formatTime(sheet.particulateSampling?.samplingStartedAt),
    samplingEndTime: formatTime(sheet.particulateSampling?.samplingEndedAt),
    thimbleFilter: sheet.particulateSampling?.thimbleFilter ?? "",
    bgThimbleFilter: sheet.particulateSampling?.bgThimbleFilter ?? "",
  };
};

// ── 공통 정보 ──────────────────────────────────────────────────
// 기록지가 아니라 측정계획 스냅샷 단위의 값이다. 값의 주인이 셋이라 저장 경로도 셋으로 갈린다 —
// 채취 시각·현장 담당자는 시트 저장에 함께 실리고(같은 노드·같은 화면 소유),
// 서명란 담당자는 PATCH /tenant, 측정자 표기는 PATCH /team 이다.
// 셋 다 null(문자열은 blank 포함)을 "기존 값 유지"로 해석한다.

export const toSamplingInfoSave = (form: ScheduleBasicInfoForm): SamplingInfoSave => ({
  samplingStartedAt: unformatTime(form.samplingStartedAt),
  samplingEndedAt: unformatTime(form.samplingEndedAt),
  facilityManager: trimValue(form.facilityManager),
  samplingWitness: trimValue(form.samplingWitness),
});

// 이 폼이 다루지 않는 고객사 원장 사본(상호·주소 등)은 키 자체를 두지 않아 서버가 유지한다.
export const toTenantSnapshotUpdate = (form: ScheduleBasicInfoForm): TenantSnapshotUpdate => ({
  analyst: trimValue(form.analyst),
  technicalManager: trimValue(form.technicalManager),
});

export const toTeamSnapshotUpdate = (form: ScheduleBasicInfoForm): TeamSnapshotUpdate => ({
  mentorName: trimValue(form.mentorName),
  menteeName: trimValue(form.menteeName),
});

// 값의 주인이 셋으로 갈려 있어 스냅샷 세 곳에서 모아 온다 —
// 채취 시각·현장 담당자는 채취 스냅샷, 서명란 담당자는 고객사 스냅샷, 측정자 표기는 팀 스냅샷.
export const fromBasicInfo = (
  sampling: SamplingSnapshot | null,
  tenant: TenantSnapshot | null,
  team: TeamSnapshot | null,
): ScheduleBasicInfoForm => ({
  samplingStartedAt: formatTime(sampling?.samplingStartedAt),
  samplingEndedAt: formatTime(sampling?.samplingEndedAt),
  facilityManager: sampling?.facilityManager ?? "",
  samplingWitness: sampling?.samplingWitness ?? "",
  analyst: tenant?.analyst ?? "",
  technicalManager: tenant?.technicalManager ?? "",
  mentorName: team?.mentorName ?? "",
  menteeName: team?.menteeName ?? "",
});
