import type { MeasurementCategory } from "@shared/model";

// 측정 기록지(sheet) 입력 폼 — 모든 숫자 필드는 string(입력 표현). 변환은 mapper 한 곳에서.

export type WeatherForm = {
  pressure: string;                 // 대기압(hPa)
  unit: string;
  weatherCondition: string;
  temperature: string;
  humidity: string;
  windDirection: string;
  windSpeed: string;
};

export type MoistureForm = {
  weightBefore: string;
  weightAfter: string;
  gasMeterTempIn: string;
  gasMeterTempOut: string;
  dryGasVolumeBefore: string;
  dryGasVolumeAfter: string;
  suctionVelocity: string;
  gasMeterGaugePressure: string;
};

// 배출가스 농도 — 측정 회수(row)별로 O2/CO2/CO/NOx/SOx를 함께 입력한다.
export type GasReadingForm = {
  o2: string;
  co2: string;
  co: string;
  nox: string;
  sox: string;
};

export type ExhaustGasForm = {
  readings: GasReadingForm[];
  gasAnalyzerStartTime: string;     // "HH:mm"
  thcAnalyzerStartTime: string;
};

export type MeasurementPointForm = {
  Ts: string;                       // 배출가스온도
  Pv: string;                       // 동압
  Ps: string;                       // 정압
  inTm: string;
  outTm: string;
  beforeVm: string;
  afterVm: string;
  samplingTime: string;
  vacuumGaugePressure: string;
  finalImpingerTemperature: string;
};

export type SampleForm = {
  sampleName: string;
  startTime: string;                // "HH:mm"
  endTime: string;
  suctionQuantity: string;
  gasMeterGaugePressure: string;
  inTemperature: string;
  outTemperature: string;
  beforeVolume: string;
  afterVolume: string;
  blankSampleNumber: string;
  sampleNumber: string;
  samplingVolume: string;
};

export type ParticleSampleForm = {
  nozzleSize: string;
  Vm: string;
  samplingTime: string;
  measureStartTime: string;
  measureEndTime: string;
  samplingStartTime: string;
  samplingEndTime: string;
  thimbleFilter: string;
  bgThimbleFilter: string;
};

export type SheetForm = {
  category: MeasurementCategory;
  weather: WeatherForm;
  moisture: MoistureForm;
  exhaustGas: ExhaustGasForm;
  measurementPoints: MeasurementPointForm[];
  samples: SampleForm[];
  particleSample: ParticleSampleForm;
};

export const getDefaultWeatherForm = (): WeatherForm => ({
  pressure: "", unit: "hPa", weatherCondition: "", temperature: "",
  humidity: "", windDirection: "", windSpeed: "",
});

export const getDefaultMoistureForm = (): MoistureForm => ({
  weightBefore: "", weightAfter: "", gasMeterTempIn: "", gasMeterTempOut: "",
  dryGasVolumeBefore: "", dryGasVolumeAfter: "", suctionVelocity: "", gasMeterGaugePressure: "",
});

export const getDefaultGasReadingForm = (): GasReadingForm => ({
  o2: "", co2: "", co: "", nox: "", sox: "",
});

export const getDefaultMeasurementPointForm = (): MeasurementPointForm => ({
  Ts: "", Pv: "", Ps: "", inTm: "", outTm: "", beforeVm: "", afterVm: "",
  samplingTime: "", vacuumGaugePressure: "", finalImpingerTemperature: "",
});

export const getDefaultSampleForm = (): SampleForm => ({
  sampleName: "", startTime: "", endTime: "", suctionQuantity: "", gasMeterGaugePressure: "",
  inTemperature: "", outTemperature: "", beforeVolume: "", afterVolume: "",
  blankSampleNumber: "", sampleNumber: "", samplingVolume: "",
});

export const getDefaultParticleSampleForm = (): ParticleSampleForm => ({
  nozzleSize: "", Vm: "", samplingTime: "", measureStartTime: "", measureEndTime: "",
  samplingStartTime: "", samplingEndTime: "", thimbleFilter: "", bgThimbleFilter: "",
});

export const getDefaultSheetForm = (category: MeasurementCategory): SheetForm => ({
  category,
  weather: getDefaultWeatherForm(),
  moisture: getDefaultMoistureForm(),
  exhaustGas: {
    readings: [getDefaultGasReadingForm()],
    gasAnalyzerStartTime: "",
    thcAnalyzerStartTime: "",
  },
  measurementPoints: [getDefaultMeasurementPointForm()],
  samples: [],
  particleSample: getDefaultParticleSampleForm(),
});

// 입자상 카테고리(가스상 외)에서만 입자 시료 섹션을 노출한다.
export const isParticleCategory = (category: MeasurementCategory): boolean =>
  category !== "GAS";
