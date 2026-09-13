/**
 * 측정 데이터 입력 폼의 항목 도움말 문구.
 *
 * 현장 기록지 용어와 계산식을 모르는 사람도 무엇을 넣는 칸인지 알 수 있게 하는 것이 목적이다.
 * 계산 관련 문구는 `entities/schedule/lib/sheet-calc/`(서버 계산 파이프라인 미러링)에
 * 실제로 구현된 식만 옮긴다 — 식이 바뀌면 이 문구도 함께 고친다.
 *
 * 줄바꿈(`\n`)은 툴팁 말풍선에서 그대로 유지된다.
 */

import type { SamplingPointForm } from "./types";

export const WEATHER_HINT = {
  pressure:
    "현장 기압계로 측정한 대기압입니다.\n소수점 첫째 자리까지 입력하세요.",
  windDirection:
    "측정 현장의 풍향입니다.\n풍속이 0.5m/s 미만인 경우 '정온'을 선택합니다.",
} as const;

export const MOISTURE_HINT = {
  gaugePressure:
    "가스미터의 게이지압입니다.\n절대압력 (Pm) = Pb+Pg",
  suctionVelocity:
    "수분 채취 중 가스미터의 흡인 유속입니다.",
} as const;

export const EXHAUST_GAS_HINT = {
  gasAnalyzer: "측정 시간은 15분으로 설정됩니다.",
  standardOxygen:
    "측정시설에 등록된 표준산소농도입니다.",
  o2CorrectionFactor:
    "(21 − 표준산소농도) ÷ (21 − 실측 O₂ 평균).\n측정농도를 기준산소 조건으로 환산할 때 곱하는 계수입니다.",
  n2: "N₂ = 100 − (O₂ + CO₂ + CO)",
  standardGasDensity:
    "성분별 평균농도와 수분량으로 산출한 표준상태(0℃·760mmHg) 배출가스 밀도입니다.",
} as const;

export const POINT_HINT: Partial<Record<keyof SamplingPointForm, string>> = {
  samplingTime:
    "지점에서 입자상 물질을 채취한 시간입니다.\n전 지점이 같은 시간으로 채취하므로 한 지점에 입력하면 나머지 지점도 함께 바뀝니다.\n전 지점 합계가 총 채취시간이 되고, 채취 시작시간에 더해 종료시간이 자동 계산됩니다.",
  beforeVm:
    "채취를 시작할 때 읽은 건식가스미터(DGM) 적산값입니다.\n미터를 되돌리지 않으므로 앞 지점의 채취량-후가 기본값으로 채워집니다.\n미터를 초기화했거나 장비를 바꿨다면 직접 고쳐 입력합니다.",
  afterVm:
    "채취를 끝낼 때 읽은 건식가스미터(DGM) 적산값입니다.\n(후 − 전) 이 그 지점의 채취량(Vm)이고, 이 값이 다음 지점의 채취량-전으로 이어집니다.",
};

/** 측정점 계산 결과 행 — 라벨 순서와 1:1 로 대응한다 */
export const POINT_RESULT_HINT = {
  Vs: "Cp × √(19.62 × 동압 ÷ 배출가스밀도) 로 구한 지점별 유속입니다.",
  orificeDp:
    "K-Factor × 동압.\n현장에서 흡인유량을 이 차압에 맞추면 등속흡입이 됩니다.",
  kFactor:
    "등속흡입에 필요한 오리피스 차압을 구하는 계수입니다.\n노즐경의 4제곱, 피토관 계수의 제곱, 수분량에 따라 달라집니다.",
  Vm: "(흡입량 후 − 전) 으로 구한 그 지점의 채취량입니다.",
  isokineticRatio:
    "실제 흡인속도가 배출가스 유속과 얼마나 일치했는지를 나타내는 비율입니다.\n일반적으로 90~110% 범위를 벗어나면 재채취 대상입니다.",
} as const;

export const PARTICLE_HINT = {
  requiredPointCount:
    "원형 굴뚝은 지름에 따라 1m 이하 1점, 2m 이하 2점, 4m 이하 3점, 4.5m 이하 4점, 그 이상 5점입니다.\n사각 굴뚝은 1점입니다.",
  nozzleSize:
    "실제로 장착한 노즐의 지름입니다.\n [적정 노즐사이즈 산정] 의 추천 목록에서 고르면 이 값이 채워집니다.",
  samplingStartTime:
    "입자상 물질 채취를 시작한 시각입니다.\n종료 시각은 시작 시각에 전 지점 채취 시간 합계를 더해 자동 계산됩니다.",
  estimatedOrificeDp:
    "K-Factor × 평균 동압으로 구하며, 지점별 실제 차압은 아래 지점 표에서 확인합니다.",
  estimatedSamplingTime:
    "희망 흡입량을 채우는 데 걸리는 예상 채취시간입니다.\n측정점 평균 조건 기준이라 지점별 실제 시간과는 차이가 날 수 있습니다.",
  estimatedVm:
    "희망 채취량(표준상태)을 현장 가스미터 조건(온도·압력)으로 환산한 예상 채취량입니다.",
  Cp: "장비 원장의 속도구간별 피토관 계수 중 산출된 유속에 해당하는 값이 자동 선택됩니다.\n등록된 계수가 없으면 0.84 를 씁니다.",
  gasDensity: "실제 배출가스 밀도입니다.\n",
  gasVelocity: "Vs = Cp × √(19.62 × 동압 ÷ 배출가스밀도)",
  quantity: "3600 × 굴뚝 단면적 × 평균 유속 로 구한 현장 조건의 습윤 유량입니다.",
  standardQuantity: "습윤 유량을 표준상태(0℃·760mmHg)·건조 기준으로 환산한 값입니다.",
} as const;

/** 가스상 물질 채취 항목 — 기록지마다 항목 수만큼 행이 생긴다 */
export const GAS_SAMPLE_HINT = {
  sampleName: "채취한 가스상 오염물질의 항목명입니다.\n측정항목 순서대로 기입하면 기록지 행과 그대로 대응합니다.",
  suctionQuantity: "채취 중 유지한 흡인 유량입니다.",
  gasMeterGaugePressure: "가스미터 게이지압입니다.\n대기압과 합해 가스미터 절대압력이 되고, 표준상태 환산에 쓰입니다.",
  gasMeterTemperature: "가스미터 입구·출구 온도입니다.\n두 값의 평균이 가스미터 온도가 되어 표준상태 환산에 쓰입니다.",
  samplingVolume: "이 항목으로 채취한 시료의 양입니다.",
  volume: "채취 전·후 가스미터 적산값입니다.\n(후 − 전) 이 실제 흡인량입니다.",
  sampleNumber: "실제로 시료를 채취한 용기(흡수병·흡착관 등)의 번호입니다.",
  blankSampleNumber:
    "채취하지 않고 같은 조건에 노출·운반한 대조용 시료의 번호입니다.\n본시료와 비교해 바탕값을 확인하는 데 씁니다.",
} as const;

export const THIMBLE_HINT = {
  thimbleFilter: "실제로 시료를 채취한 원통여지의 번호입니다.",
  bgThimbleFilter:
    "채취하지 않고 같은 조건에 노출·운반한 대조용 여지의 번호입니다.\n채취 여지와 비교해 바탕값을 확인하는 데 씁니다.",
} as const;
