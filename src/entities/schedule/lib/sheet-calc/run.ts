import type { SheetSave } from "../../model/types";
import type { SheetCalcContext } from "./context";
import { createSheetCalcContext } from "./context";
import { toSheetCalcPreview } from "./preview";
import { SHEET_CALC_STEPS } from "./steps";
import type { SheetCalcExternals, SheetCalcPreview } from "./types";

// ─────────────────────────────────────────────────────────────
// 측정 시트 계산 미리보기 — 서버 계산 파이프라인(schedule/application/calculation)의
// 프론트 미러링. 서버가 authority이며 이 결과는 저장 전 미리보기(추정)다.
//
// 스텝 순서·상수·공식은 서버와 1:1 이며, 순서는 steps/index.ts 의
// SHEET_CALC_STEPS 배열이 소유한다.
//
// 파리티 필수 사항:
//  - 반올림은 서버와 동일하게 각 나눗셈 지점에서 HALF_UP scale을 적용한다.
//    (ParticleStep 내부 나눗셈은 scale 10 — 서버 SCALE 상수와 동일)
//  - null/부분입력은 서버 가드와 동일하게 조용히 건너뛴다(미완성 시트도 부분계산).
//    단, moisture의 ma/tm_g/vm_g는 입력 중 피드백을 위해 개별 가드로 계산한다
//    (서버는 수분 입력 전체가 완성돼야 채움 — 저장 시 서버 값으로 대체됨).
//  - 평균 정책 이원화: InitStep 평균은 null→0 취급, ParticleStep 집계는 null 제외.
// ─────────────────────────────────────────────────────────────

// 노즐 추천 등 파생 계산이 중간값(Md·Mw·Pg 등)을 재사용할 수 있도록 컨텍스트를 노출한다.
export const runSheetCalc = (sheet: SheetSave, ext: SheetCalcExternals): SheetCalcContext => {
  const ctx = createSheetCalcContext((sheet.samplingPoints ?? []).length);
  const input = { sheet, ext };

  for (const step of SHEET_CALC_STEPS) step(ctx, input);

  return ctx;
};

export const calcSheetPreview = (sheet: SheetSave, ext: SheetCalcExternals): SheetCalcPreview =>
  toSheetCalcPreview(runSheetCalc(sheet, ext));
