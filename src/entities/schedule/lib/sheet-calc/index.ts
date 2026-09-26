// 측정 시트 계산 모듈의 공개 API.
// 내부 구성: types(계약) · math/convert/formula(유틸) · constants · steps(스텝별 계산)
//           · context(누적 상태) · run(파이프라인) · preview(결과 배치) · externals(입력 추출)

export type { PitotCoefficient, SheetCalcExternals, SheetCalcPointPreview, SheetCalcPreview } from "./types";
export type { SheetCalcContext } from "./context";

export { runSheetCalc, calcSheetPreview } from "./run";
export { calcRequiredPointCount, calcExhaustGasAverage } from "./steps";
export { getSheetCalcExternals } from "./externals";

// 같은 lib 안의 파생 계산(nozzle-recommend)이 공유하는 상수
export { DEFAULT_DELTA_H, K_FACTOR_CONST, MOISTURE_RATIO } from "./constants";

// 화면·기록지가 계산 결과를 다른 단위로 보여줄 때 쓰는 환산 — 호출부가 공식을 다시 적지 않는다
export { convertMmH2OToMmHg, toCelsius, convertPerHourToPerMinute } from "./convert";
