import type { Shape } from "@shared/model";

// 계산의 입출력 타입. 외부(feature·widget)에 노출되는 공개 계약이다.

export type PitotCoefficient = { coefficient: number; velocity: number };

// 시트 밖(측정시설 원장·팀 장비 스냅샷)에서 가져오는 계산 입력
export type SheetCalcExternals = {
  stackName: string;
  standardOxygen: number | null;              // 기준산소농도 (측정시설 원장)
  shape: Shape | null;                        // 굴뚝 형상 (단면적·규정 측정점 수 계산)
  horizontalLength: number | null;            // 지름 또는 가로 (m)
  verticalLength: number | null;              // 세로 (m, 사각형)
  pitotCoefficients: PitotCoefficient[];      // 피토관 계수 테이블 (팀 장비 스냅샷)
  deltaH: number | null;                      // 오리피스 보정계수 △H@ (ParticleSampler spec, 없으면 46)
  nozzleDiameters: number[];                  // 노즐경 목록 (Nozzle spec, 추천용)
};

export type SheetCalcPointPreview = {
  avgTm: number | null;                       // (inTm+outTm)/2 (°C)
  Vs: number | null;                          // 점별 유속 (m/s)
  Vm: number | null;                          // 건식가스미터 채취량 (m³)
  Vlc: number | null;                         // 채취된 물의 총량 (ml)
  kFactor: number | null;
  orificeDp: number | null;
  isokineticRatio: number | null;             // 등속흡입계수 (%)
};

export type SheetCalcPreview = {
  weather: {
    pa: number | null;                        // 대기압 (mmHg)
  };
  moisture: {
    pm_g: number | null;                      // 가스미터 게이지압 (mmHg)
    pmGInchH2O: number | null;                // 게이지압 inchH₂O 환산 (표시 전용, 서버 미저장)
    tm_g: number | null;                      // 가스미터 평균온도 (°C)
    vm_g: number | null;                      // 흡입 건조가스량 (L)
    ma: number | null;                        // 흡습 수분질량 (g)
    xw: number | null;                        // 수분량 (%)
  };
  exhaustGas: {
    o2Avg: number | null;                     // 평균 농도 (표시 전용, 서버 미저장)
    co2Avg: number | null;
    coAvg: number | null;
    n2: number | null;
    noxAvg: number | null;
    soxAvg: number | null;
    standardGasDensity: number | null;        // 표준상태 배출가스밀도
    o2CorrectionFactor: number | null;        // 산소보정계수
  };
  quantity: {
    avgTg: number | null;                     // 배출가스 절대온도 (K)
    avgPv: number | null;
    avgPs: number | null;
    gasDensity: number | null;                // 현장조건 배출가스 밀도
    area: number | null;                      // 측정시설 단면적 (m²)
    Vs: number | null;                        // 평균 유속 (m/s)
    quantity: number | null;                  // 현장 습윤 유량 (m³/h)
    standardQuantity: number | null;          // 표준상태 건조 유량 (Sm³/h)
    Cp: number | null;                        // 피토관 계수
  };
  particle: {
    avgKFactor: number | null;
    avgOrificeDp: number | null;
    avgIsokineticRatio: number | null;
    totalVm: number | null;
    totalSamplingTime: number | null;
  };
  points: SheetCalcPointPreview[];            // 폼 측정점 배열과 인덱스 1:1
  samplingPointCnt: number | null;            // 규정상 요구 측정점 수
  avgTm: number | null;                       // 가스미터 절대온도 (K)
};
