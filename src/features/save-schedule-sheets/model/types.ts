import type { MeasurementCategory } from "@shared/model";

// 측정 기록지(sheet) 입력 폼 — 모든 숫자 필드는 string(입력 표현). 변환은 mapper 한 곳에서.

export type WeatherForm = {
  pressure: string;
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
  samplingStartTime: string;        // 시트별 수분 채취 시작시간 "HH:mm"
  samplingEndTime: string;          // 시트별 수분 채취 종료시간 "HH:mm"
};

// 배출가스 측정 회수는 3회로 고정한다(행 추가·삭제 없음).
export const GAS_READING_COUNT = 3;

// 농도 컬럼 키 — 각 컬럼은 길이 GAS_READING_COUNT의 회차별 입력값 배열이다.
export type GasColumnKey = "o2" | "co2" | "co" | "nox" | "sox";

export type ExhaustGasForm = {
  o2: string[];
  co2: string[];
  co: string[];
  nox: string[];
  sox: string[];       // 길이 GAS_READING_COUNT 고정
  gasAnalyzerStartTime: string;     // "HH:mm"
  thcAnalyzerStartTime: string;
};

// 측정점 입력 — 유량(Ts/Pv/Ps)은 항상, 나머지는 입자상 시트에서만 사용된다(mapper에서 분기).
export type SamplingPointForm = {
  Ts: string;                       // 배출가스온도
  Pv: string;                       // 동압
  Ps: string;                       // 정압
  inTm: string;                     // DGM 입구온도
  outTm: string;                    // DGM 출구온도
  beforeVm: string;                 // 흡입량 (전)
  afterVm: string;                  // 흡입량 (후)
  samplingTime: string;             // 채취시간 (min)
  vacuumGaugePressure: string;
  finalImpingerTemperature: string;
};

export type SampleForm = {
  /**
   * 이 시료 행이 담은 측정항목(pollutantId). **폼의 모든 값은 string 이라는 규칙의 의도적 예외**다 —
   * 사용자가 타이핑하는 칸이 아니라 행에 딸린 링크이므로 입력 표현이 필요 없다.
   *
   * 빈 배열은 사용자가 직접 추가한 행이라는 뜻이다. 측정항목에서 만들어진 행과 구분되며,
   * 이 구분이 "이 항목이 이미 어느 기록지에 적혔는가" 판정의 근거가 된다.
   */
  pollutantIds: number[];
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

// 입자상 시트 단위 입력 — nozzleSize는 UI상 시트당 1개 선택이며 저장 시 전 측정점에 동일 기입된다.
export type ParticleForm = {
  nozzleSize: string;               // 노즐경 (cm)
  samplingStartTime: string;        // 채취시작시간 "HH:mm"
  samplingEndTime: string;          // 채취종료시간 (시작 + Σ채취시간 자동 계산)
  thimbleFilter: string;            // 측정여지번호
  bgThimbleFilter: string;          // 바탕여지번호
};
export type SheetForm = {
  category: MeasurementCategory;
  // 서버가 소유하는 낙관적 락 토큰. 사용자가 편집하지 않고 왕복만 하며,
  // null 이면 아직 서버에 저장된 적 없는 신규 시트다.
  version: number | null;
  weather: WeatherForm;
  moisture: MoistureForm;
  exhaustGas: ExhaustGasForm;
  samplingPoints: SamplingPointForm[];
  samples: SampleForm[];
  particle: ParticleForm;
};

export const getDefaultWeatherForm = (): WeatherForm => ({
  pressure: "", weatherCondition: "", temperature: "",
  humidity: "", windDirection: "", windSpeed: "",
});

export const getDefaultMoistureForm = (): MoistureForm => ({
  weightBefore: "", weightAfter: "", gasMeterTempIn: "", gasMeterTempOut: "",
  dryGasVolumeBefore: "", dryGasVolumeAfter: "", suctionVelocity: "", gasMeterGaugePressure: "",
  samplingStartTime: "", samplingEndTime: "",
});

// 회차별 컬럼 초기값 — 대기 중 산소농도(20.9%)를 O₂ 기본값으로 둔다.
// NOx·SOx는 비워 둔다. 측정항목에 배정됐을 때만 입력칸이 열리는데 0을 미리 채우면
// "입력값이 있다"고 잡혀 조건부 노출이 무력화되고, 측정하지도 않은 0이 서버에 기록된다.
const defaultColumn = (value: string): string[] =>
  Array.from({ length: GAS_READING_COUNT }, () => value);

export const getDefaultExhaustGasForm = (): ExhaustGasForm => ({
  o2: defaultColumn("20.9"),
  co2: defaultColumn("0"),
  co: defaultColumn("0"),
  nox: defaultColumn(""),
  sox: defaultColumn(""),
  gasAnalyzerStartTime: "",
  thcAnalyzerStartTime: "",
});

export const getDefaultSamplingPointForm = (): SamplingPointForm => ({
  Ts: "", Pv: "", Ps: "", inTm: "", outTm: "", beforeVm: "", afterVm: "",
  samplingTime: "", vacuumGaugePressure: "", finalImpingerTemperature: "",
});

export const getDefaultSampleForm = (): SampleForm => ({
  pollutantIds: [],
  sampleName: "", startTime: "", endTime: "", suctionQuantity: "", gasMeterGaugePressure: "",
  inTemperature: "", outTemperature: "", beforeVolume: "", afterVolume: "",
  blankSampleNumber: "", sampleNumber: "", samplingVolume: "",
});

export const getDefaultParticleForm = (): ParticleForm => ({
  nozzleSize: "", samplingStartTime: "", samplingEndTime: "",
  thimbleFilter: "", bgThimbleFilter: "",
});

// pointCount: 굴뚝 치수 기반 규정 요구 측정점 수(자동 산출). 수동 추가/삭제로 조정 가능.
export const getDefaultSheetForm = (category: MeasurementCategory, pointCount = 1): SheetForm => ({
  category,
  version: null,
  weather: getDefaultWeatherForm(),
  moisture: getDefaultMoistureForm(),
  exhaustGas: getDefaultExhaustGasForm(),
  samplingPoints: Array.from({ length: Math.max(1, pointCount) }, getDefaultSamplingPointForm),
  samples: [],
  particle: getDefaultParticleForm(),
});

export type ScheduleBasicInfoForm = {
  samplingStartedAt: string;        // "HH:mm"
  samplingEndedAt: string;
  facilityManager: string;          // 배출시설관리자
  samplingWitness: string;          // 시료채취입회자(환경기술인)
  analyst: string;                  // 시료분석검사자
  technicalManager: string;         // 기술책임자
  mentorName: string;               // 채취자(사수)
  menteeName: string;               // 채취자(부사수)
};

export const getDefaultBasicInfoForm = (): ScheduleBasicInfoForm => ({
  samplingStartedAt: "", samplingEndedAt: "",
  facilityManager: "", samplingWitness: "", analyst: "", technicalManager: "",
  mentorName: "", menteeName: "",
});

// 입자상 카테고리(가스상 외)에서만 입자 시료 섹션을 노출한다.
export const isParticleCategory = (category: MeasurementCategory): boolean =>
  category !== "GAS";
