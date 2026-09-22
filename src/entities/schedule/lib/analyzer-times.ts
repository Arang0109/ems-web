import { addMinutes } from "@shared/lib";

/**
 * 현장측정 분석기의 고정 측정시간. 규정상 시작시각만 적고 종료는 시작 + 고정 시간이다.
 *
 * 현장채취 탭(배출가스 섹션 도움말·타임라인·인쇄)과 성적서 탭(항목별 채취시각 가져오기)이 함께 쓰므로
 * feature 가 아니라 여기 둔다 — 두 화면이 다른 종료시각을 말하면 안 된다.
 */

/** 가스분석기 측정은 시작 후 15분 고정 (서버 `ExhaustGasData` 주석과 같은 규약) */
export const GAS_ANALYZER_DURATION_MINUTES = 15;

/** THC 분석기 측정은 시작 후 30분 고정 */
export const THC_ANALYZER_DURATION_MINUTES = 30;

/** 가스분석기 측정 종료시각. 시작이 비었으면 `null` — 표시용 대체값은 호출부가 정한다. */
export const calcGasAnalyzerEndTime = (start: string): string | null =>
  addMinutes(start, GAS_ANALYZER_DURATION_MINUTES);

/** THC 측정 종료시각. 시작이 비었으면 `null`. */
export const calcThcAnalyzerEndTime = (start: string): string | null =>
  addMinutes(start, THC_ANALYZER_DURATION_MINUTES);
